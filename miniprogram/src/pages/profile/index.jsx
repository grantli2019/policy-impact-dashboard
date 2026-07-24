import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { personas, policyDividends } from '../../data/policies'
import './index.scss'

export default function Profile() {
  const [persona, setPersona] = useState(() => Taro.getStorageSync('persona') || '')
  const dividends = policyDividends[persona] || policyDividends['worker']
  const totalValue = dividends.reduce((s, d) => s + Math.max(0, d.amount), 0)
  const currentPersona = personas.find(p => p.key === persona)

  const onSelectPersona = (key) => {
    setPersona(key)
    Taro.setStorageSync('persona', key)
    Taro.showToast({ title: `已切换为${personas.find(p => p.key === key)?.label}`, icon: 'success' })
  }

  const onSubscribe = () => {
    Taro.requestSubscribeMessage({
      tmplIds: ['placeholder_template_id'],
      success: () => Taro.showToast({ title: '订阅成功，政策变动时将通知你', icon: 'success' }),
      fail: () => Taro.showToast({ title: '订阅取消', icon: 'none' }),
    })
  }

  return (
    <View className="profile-page">
      {/* 用户画像选择 */}
      <View className="persona-section">
        <Text className="section-title">选择你的身份</Text>
        <Text className="section-hint">我们会根据你的身份调整政策推荐权重</Text>
        <View className="persona-grid">
          {personas.map(p => (
            <View
              key={p.key}
              className={`persona-card ${persona === p.key ? 'active' : ''}`}
              onClick={() => onSelectPersona(p.key)}
            >
              <Text className="persona-icon">{p.icon}</Text>
              <Text className="persona-label">{p.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 红利账单 */}
      {persona && (
        <View className="dividend-section">
          <Text className="section-title">你的政策红利</Text>
          <View className="dividend-total">
            <Text className="dividend-num">¥{totalValue.toLocaleString()}</Text>
            <Text className="dividend-unit">/年</Text>
          </View>
          <View className="dividend-list">
            {dividends.filter(d => d.amount > 0).map(d => (
              <View key={d.id} className="dividend-item">
                <Text className="dividend-item-label">{d.label}</Text>
                <Text className="dividend-item-amount">+¥{d.amount.toLocaleString()}/年</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 政策变动提醒 */}
      <View className="subscribe-section">
        <Text className="section-title">政策变动提醒</Text>
        <Text className="subscribe-desc">订阅后，当关注的政策发生变动时，将通过微信服务通知提醒你</Text>
        <View className="subscribe-btn" onClick={onSubscribe}>
          🔔 订阅政策变动通知
        </View>
      </View>

      {/* 关于 */}
      <View className="about-section">
        <Text className="about-text">策查查 · 读懂政策，做对决策</Text>
        <Text className="about-version">数据更新至 2026年7月18日 · 284条权威政策</Text>
      </View>
    </View>
  )
}
