import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getPolicyById } from '../../data/policies'
import './index.scss'

export default function Detail() {
  const router = useRouter()
  const policy = getPolicyById(router.params.id)

  if (!policy) {
    return (
      <View className="detail-page">
        <View className="not-found">
          <Text>未找到该政策</Text>
        </View>
      </View>
    )
  }

  const sentLabel = policy.direction > 0 ? '利好' : policy.direction < 0 ? '利空' : '中性'
  const sentClass = policy.direction > 0 ? 'good' : policy.direction < 0 ? 'bad' : 'neutral'

  return (
    <View className="detail-page">
      {/* 政策标题 */}
      <View className="detail-header">
        <View className="detail-meta">
          <Text className="detail-icon">{policy.icon}</Text>
          <Text className="detail-dim">{policy.dimLabel}</Text>
          <Text className={`detail-sent sent-${sentClass}`}>{sentLabel}</Text>
        </View>
        <Text className="detail-title">{policy.name}</Text>
        <Text className="detail-date">{policy.date} · {policy.source}</Text>
      </View>

      {/* 评分卡片 */}
      <View className="score-card">
        <View className="score-item">
          <Text className="score-label">影响广度</Text>
          <View className="score-bar-wrap">
            <View className="score-bar" style={{ width: `${policy.breadth * 10}%` }} />
          </View>
          <Text className="score-plain">{policy.plainBreadth}</Text>
        </View>
        <View className="score-item">
          <Text className="score-label">深远程度</Text>
          <View className="score-bar-wrap">
            <View className="score-bar depth" style={{ width: `${policy.depth * 10}%` }} />
          </View>
          <Text className="score-plain">{policy.plainDepth}</Text>
        </View>
        <View className="score-item">
          <Text className="score-label">确定性</Text>
          <Text className="score-conf">{policy.confidence}</Text>
        </View>
      </View>

      {/* 政策摘要 */}
      <View className="detail-section">
        <Text className="section-title">📋 政策摘要</Text>
        <Text className="section-content">{policy.note}</Text>
      </View>

      {/* 评分依据 */}
      {policy.rationale && (
        <View className="detail-section">
          <Text className="section-title">📐 评分依据</Text>
          <Text className="section-content">{policy.rationale}</Text>
        </View>
      )}

      {/* 评分方法透明化 */}
      <View className="method-note">
        <Text className="method-text">
          评分基于 OECD RIA 框架：{policy.plainBreadth}（广度{policy.breadth}/10）× {policy.plainDepth}（深度{policy.depth}/10）× 方向 × 确定性。数据来源为政府官方网站，最后验证于 2026年7月18日。
        </Text>
      </View>

      {/* 信源链接 */}
      {policy.url && (
        <View className="source-link" onClick={() => Taro.setClipboardData({ data: policy.url })}>
          <Text className="source-link-text">📄 查看政策原文（点击复制链接）</Text>
          <Text className="source-link-url">{policy.url}</Text>
        </View>
      )}

      {/* 行动按钮 */}
      <View className="action-bar">
        <View className="action-btn" onClick={() => Taro.switchTab({ url: '/pages/calculator/index' })}>
          ⚡ 用计算器测算影响
        </View>
      </View>
    </View>
  )
}
