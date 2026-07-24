import { useState, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { searchPolicies } from '../../data/policies'
import './index.scss'

export default function Search() {
  const router = useRouter()
  const [query, setQuery] = useState(decodeURIComponent(router.params.q || ''))
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.trim()) {
      const res = searchPolicies(query.trim())
      setResults(res)
    }
  }, [query])

  const onSearch = () => {
    if (!query.trim()) return
    const res = searchPolicies(query.trim())
    setResults(res)
  }

  const onPolicyTap = (id) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  const onCalcTap = () => {
    Taro.switchTab({ url: '/pages/calculator/index' })
  }

  return (
    <View className="search-page">
      <View className="search-bar">
        <Input
          className="search-input"
          placeholder="搜索政策关键词"
          value={query}
          onInput={(e) => setQuery(e.detail.value)}
          onConfirm={onSearch}
          confirmType="search"
          focus
        />
        <View className="search-btn" onClick={onSearch}>搜索</View>
      </View>

      {results.length > 0 && (
        <View className="result-summary">
          找到 {results.length} 条相关政策
        </View>
      )}

      <ScrollView scrollY className="result-list">
        {results.map(r => (
          <View key={r.id} className="result-card" onClick={() => onPolicyTap(r.id)}>
            <View className="result-header">
              <Text className="result-icon">{r.icon}</Text>
              <Text className="result-dim">{r.dimLabel}</Text>
              <Text className={`result-sent sent-${r.direction > 0 ? 'good' : r.direction < 0 ? 'bad' : 'neutral'}`}>
                {r.direction > 0 ? '利好' : r.direction < 0 ? '利空' : '中性'}
              </Text>
            </View>
            <Text className="result-name">{r.name}</Text>
            <Text className="result-note">{r.note}</Text>
            <View className="result-footer">
              <Text className="result-plain">{r.plainScore}</Text>
              <Text className="result-source">{r.source}</Text>
            </View>
            {/* P0: 下一步行动按钮 */}
            <View className="result-action" onClick={(e) => { e.stopPropagation(); onCalcTap(); }}>
              ⚡ 下一步：用计算器测算对你的具体影响 →
            </View>
          </View>
        ))}

        {query && results.length === 0 && (
          <View className="empty-state">
            <Text className="empty-icon">🔍</Text>
            <Text className="empty-text">未找到相关政策</Text>
            <Text className="empty-hint">试试换个关键词，如"公积金""限购""退休"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
