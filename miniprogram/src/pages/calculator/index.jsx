import { useState } from 'react'
import { View, Text, Input, Slider } from '@tarojs/components'
import './index.scss'

const TOOLS = [
  { id: 'gjj', name: '公积金贷款计算', icon: '🏠', desc: '算算你能贷多少、月供多少' },
  { id: 'tax', name: '个税优化计算', icon: '💰', desc: '专项附加扣除能省多少税' },
  { id: 'pension', name: '养老金估算', icon: '👴', desc: '退休后每月能领多少' },
]

export default function Calculator() {
  const [activeTool, setActiveTool] = useState('gjj')
  const [salary, setSalary] = useState(15000)
  const [gjjBase, setGjjBase] = useState(15000)
  const [gjjRate, setGjjRate] = useState(12)
  const [years, setYears] = useState(30)
  const [loanAmount, setLoanAmount] = useState(1000000)

  // 公积金贷款计算
  const gjjMonthly = gjjBase * gjjRate / 100 * 2
  const gjjLoanMax = Math.min(gjjMonthly * 12 * years * 0.4, 1200000)
  const monthlyPayment = Math.round(loanAmount * 0.0031 * Math.pow(1.0031, years * 12) / (Math.pow(1.0031, years * 12) - 1))
  const totalInterest = monthlyPayment * years * 12 - loanAmount

  // 个税计算
  const deductions = 5000 + 1000 + 1000 + 2000 + 1000
  const taxableIncome = Math.max(0, salary * 12 - deductions * 12)
  const taxBefore = calcTax(salary * 12 - 5000 * 12)
  const taxAfter = calcTax(taxableIncome)
  const taxSaving = taxBefore - taxAfter

  return (
    <View className="calc-page">
      {/* 工具选择 */}
      <View className="tool-tabs">
        {TOOLS.map(t => (
          <View
            key={t.id}
            className={`tool-tab ${activeTool === t.id ? 'active' : ''}`}
            onClick={() => setActiveTool(t.id)}
          >
            <Text className="tool-tab-icon">{t.icon}</Text>
            <Text className="tool-tab-name">{t.name}</Text>
          </View>
        ))}
      </View>

      {/* 公积金计算器 */}
      {activeTool === 'gjj' && (
        <View className="calc-card">
          <Text className="calc-title">🏠 公积金贷款计算</Text>

          <View className="calc-field">
            <Text className="calc-label">月缴存基数：¥{gjjBase.toLocaleString()}</Text>
            <Slider min={3000} max={40000} step={500} value={gjjBase}
              activeColor="#1a56db" onChange={(e) => setGjjBase(e.detail.value)} />
          </View>

          <View className="calc-field">
            <Text className="calc-label">缴存比例：{gjjRate}%</Text>
            <Slider min={5} max={12} step={1} value={gjjRate}
              activeColor="#1a56db" onChange={(e) => setGjjRate(e.detail.value)} />
          </View>

          <View className="calc-field">
            <Text className="calc-label">贷款年限：{years}年</Text>
            <Slider min={5} max={30} step={5} value={years}
              activeColor="#1a56db" onChange={(e) => setYears(e.detail.value)} />
          </View>

          <View className="calc-field">
            <Text className="calc-label">贷款金额：¥{loanAmount.toLocaleString()}</Text>
            <Slider min={100000} max={2000000} step={50000} value={loanAmount}
              activeColor="#1a56db" onChange={(e) => setLoanAmount(e.detail.value)} />
          </View>

          <View className="calc-results">
            <View className="calc-result-item">
              <Text className="calc-result-label">每月公积金入账</Text>
              <Text className="calc-result-value">¥{gjjMonthly.toLocaleString()}</Text>
            </View>
            <View className="calc-result-item">
              <Text className="calc-result-label">最高可贷额度</Text>
              <Text className="calc-result-value highlight">¥{Math.round(gjjLoanMax).toLocaleString()}</Text>
            </View>
            <View className="calc-result-item">
              <Text className="calc-result-label">月供（3.1%利率）</Text>
              <Text className="calc-result-value">¥{monthlyPayment.toLocaleString()}</Text>
            </View>
            <View className="calc-result-item">
              <Text className="calc-result-label">总利息</Text>
              <Text className="calc-result-value warning">¥{Math.round(totalInterest).toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 个税计算器 */}
      {activeTool === 'tax' && (
        <View className="calc-card">
          <Text className="calc-title">💰 个税优化计算</Text>

          <View className="calc-field">
            <Text className="calc-label">月薪：¥{salary.toLocaleString()}</Text>
            <Slider min={5000} max={100000} step={1000} value={salary}
              activeColor="#1a56db" onChange={(e) => setSalary(e.detail.value)} />
          </View>

          <View className="calc-info">
            <Text className="calc-info-title">已计入的专项附加扣除：</Text>
            <Text className="calc-info-item">• 子女教育 ¥1,000/月</Text>
            <Text className="calc-info-item">• 继续教育 ¥1,000/月</Text>
            <Text className="calc-info-item">• 住房贷款 ¥2,000/月</Text>
            <Text className="calc-info-item">• 赡养老人 ¥1,000/月</Text>
          </View>

          <View className="calc-results">
            <View className="calc-result-item">
              <Text className="calc-result-label">扣除前年缴税</Text>
              <Text className="calc-result-value">¥{taxBefore.toLocaleString()}</Text>
            </View>
            <View className="calc-result-item">
              <Text className="calc-result-label">扣除后年缴税</Text>
              <Text className="calc-result-value">¥{taxAfter.toLocaleString()}</Text>
            </View>
            <View className="calc-result-item">
              <Text className="calc-result-label">每年节税</Text>
              <Text className="calc-result-value highlight">¥{taxSaving.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 养老金计算器 */}
      {activeTool === 'pension' && (
        <View className="calc-card">
          <Text className="calc-title">👴 养老金估算</Text>
          <View className="calc-placeholder">
            <Text className="placeholder-text">养老金计算器正在开发中...</Text>
            <Text className="placeholder-hint">敬请期待，将支持按不同退休时间点对比待遇差异</Text>
          </View>
        </View>
      )}
    </View>
  )
}

function calcTax(annualTaxable) {
  if (annualTaxable <= 0) return 0
  if (annualTaxable <= 36000) return Math.round(annualTaxable * 0.03)
  if (annualTaxable <= 144000) return Math.round(annualTaxable * 0.1 - 2520)
  if (annualTaxable <= 300000) return Math.round(annualTaxable * 0.2 - 16920)
  if (annualTaxable <= 420000) return Math.round(annualTaxable * 0.25 - 31920)
  if (annualTaxable <= 660000) return Math.round(annualTaxable * 0.3 - 52920)
  if (annualTaxable <= 960000) return Math.round(annualTaxable * 0.35 - 85920)
  return Math.round(annualTaxable * 0.45 - 181920)
}
