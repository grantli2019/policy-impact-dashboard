import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { hotPolicies, policyDividends } from '../../data/policies'
import './index.scss'

export default function Index() {
  const [query, setQuery] = useState('')
  const persona = Taro.getStorageSync('persona') || 'worker'
  const dividends = policyDividends[persona] || policyDividends['worker']
  const totalValue = dividends.reduce((s, d) => s + Math.max(0, d.amount), 0)

  const onSearch = () => {
    if (!query.trim()) return
    Taro.navigateTo({ url: `/pages/search/index?q=${encodeURIComponent(query.trim())}` })
  }

  const onHotTap = (keyword) => {
    Taro.navigateTo({ url: `/pages/search/index?q=${encodeURIComponent(keyword)}` })
  }

  const onPolicyTap = (id) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  return (
    <View className="index-page">
      {/* 品牌区 */}
      <View className="hero">
        <Text className="hero-title">读懂政策，做对决策</Text>
        <Text className="hero-sub">覆盖房产、就业、教育、养老、消费、行业六大维度</Text>
      </View>

      {/* 搜索框 */}
      <View className="search-box">
        <Input
          className="search-input"
          placeholder="搜索政策（如：公积金、限购、退休）"
          value={query}
          onInput={(e) => setQuery(e.detail.value)}
          onConfirm={onSearch}
          confirmType="search"
        />
        <View className="search-btn" onClick={onSearch}>搜索</View>
      </View>

      {/* 红利数字 — Aha Moment */}
      <View className="dividend-card" onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>
        <View className="dividend-header">
          <Text className="dividend-label">你的政策红利账单</Text>
          <Text className="dividend-badge">基于284条权威政策</Text>
        </View>
        <View className="dividend-amount">
          <Text className="dividend-num">¥{totalValue.toLocaleString()}</Text>
          <Text className="dividend-unit">/年</Text>
        </View>
        <Text className="dividend-hint">同类人中，仅 31% 已完整享受这些红利 →</Text>
      </View>

      {/* 热门搜索 */}
      <View className="hot-section">
        <Text className="section-title">热门搜索</Text>
        <View className="hot-tags">
          {['公积金', '延迟退休', '个税', '限购', '生育', '利率'].map(tag => (
            <Text key={tag} className="hot-tag" onClick={() => onHotTap(tag)}>{tag}</Text>
          ))}
        </View>
      </View>

      {/* 本周热点政策 */}
      <View className="policy-section">
        <Text className="section-title">本周热点政策</Text>
        <ScrollView scrollY className="policy-list">
          {hotPolicies.map(p => (
            <View key={p.id} className="policy-card" onClick={() => onPolicyTap(p.id)}>
              <View className="policy-card-header">
                <Text className="policy-icon">{p.icon}</Text>
                <Text className="policy-dim">{p.dimLabel}</Text>
                <Text className={`policy-sent sent-${p.direction > 0 ? 'good' : p.direction < 0 ? 'bad' : 'neutral'}`}>
                  {p.direction > 0 ? '利好' : p.direction < 0 ? '利空' : '中性'}
                </Text>
              </View>
              <Text className="policy-name">{p.name}</Text>
              <Text className="policy-note">{p.note}</Text>
              <View className="policy-footer">
                <Text className="policy-plain">{p.plainScore}</Text>
                <Text className="policy-action">查看详情 →</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}
