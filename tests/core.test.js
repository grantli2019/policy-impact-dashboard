/**
 * 策查查核心函数单元测试
 * 覆盖：评分引擎、搜索逻辑、工具计算、数据完整性
 */
import { describe, it, expect } from 'vitest'
import {
  dimensions, calcDimensionScore, calcOverallIndex, getIndexLevel,
  personas, regions, searchScenes, lifeStages, specialTopics,
  getSourceFromUrl, enhancedTestimonials, newsLianboUpdates,
  regionToolParams,
} from '../src/data/impactData'

/* ═══════ 评分引擎测试 ═══════ */
describe('评分引擎', () => {
  it('每个维度评分应在0-100之间', () => {
    dimensions.forEach(dim => {
      const score = calcDimensionScore(dim)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  it('综合指数应在0-100之间', () => {
    personas.forEach(p => {
      const idx = calcOverallIndex(p.key, 'national')
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThanOrEqual(100)
    })
  })

  it(' getIndexLevel应返回有效等级', () => {
    expect(getIndexLevel(85)).toBeDefined()
    expect(getIndexLevel(50)).toBeDefined()
    expect(getIndexLevel(20)).toBeDefined()
  })

  it('每个维度应有scores数组且非空', () => {
    dimensions.forEach(dim => {
      expect(dim.scores).toBeDefined()
      expect(dim.scores.length).toBeGreaterThan(0)
    })
  })

  it('每条政策应有完整字段', () => {
    dimensions.forEach(dim => {
      dim.scores.forEach(s => {
        expect(s.policyName).toBeTruthy()
        expect(s.breadth).toBeGreaterThanOrEqual(1)
        expect(s.breadth).toBeLessThanOrEqual(10)
        expect(s.depth).toBeGreaterThanOrEqual(1)
        expect(s.depth).toBeLessThanOrEqual(10)
        expect([-1, 0, 1]).toContain(s.direction)
        expect(s.confidence).toBeTruthy()
        expect(s.url).toBeTruthy()
      })
    })
  })
})

/* ═══════ 数据完整性测试 ═══════ */
describe('数据完整性', () => {
  it('应有6个维度', () => {
    expect(dimensions.length).toBe(6)
  })

  it('应有6个区域', () => {
    expect(regions.length).toBeGreaterThanOrEqual(6)
  })

  it('每个区域应有工具参数', () => {
    const regionKeys = regions.map(r => r.key)
    regionKeys.forEach(key => {
      expect(regionToolParams[key]).toBeDefined()
      expect(regionToolParams[key].gjjRate).toBeGreaterThan(0)
    })
  })

  it('搜索场景应覆盖危机关键词', () => {
    const crisisScene = searchScenes.find(s => s.id === 'crisis_help')
    expect(crisisScene).toBeDefined()
    expect(crisisScene.keywords).toContain('失业')
    expect(crisisScene.keywords).toContain('断缴')
  })

  it('人生阶段应包含职业危机', () => {
    const crisis = lifeStages.find(s => s.key === 'career_crisis')
    expect(crisis).toBeDefined()
    expect(crisis.crisisMode).toBe(true)
    expect(crisis.urgentActions.length).toBeGreaterThan(0)
  })

  it('专题应包含失业应急包', () => {
    const topic = specialTopics.find(t => t.id === 'crisis_unemployment')
    expect(topic).toBeDefined()
    expect(topic.emergencyActions.length).toBe(6)
    expect(topic.faqList.length).toBeGreaterThanOrEqual(6)
    expect(topic.hotlines.length).toBe(4)
  })

  it('案例墙应有45+条', () => {
    expect(enhancedTestimonials.length).toBeGreaterThanOrEqual(45)
  })

  it('新闻应有100+条', () => {
    expect(newsLianboUpdates.length).toBeGreaterThanOrEqual(100)
  })

  it('新闻日期格式正确', () => {
    newsLianboUpdates.forEach(n => {
      expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(n.title).toBeTruthy()
      expect(n.dim).toBeTruthy()
      expect(n.source).toBeTruthy()
    })
  })
})

/* ═══════ 信息源测试 ═══════ */
describe('信息源权威性', () => {
  it('getSourceFromUrl应识别gov.cn域名', () => {
    const result = getSourceFromUrl('https://www.mohurd.gov.cn/some/path')
    expect(result.issuingBody).toBe('住建部')
  })

  it('getSourceFromUrl应识别上海人社局', () => {
    const result = getSourceFromUrl('https://rsj.sh.gov.cn/xxzxfb03')
    expect(result.issuingBody).toBe('上海市人社局')
  })

  it('所有政策URL应指向官方域名', () => {
    dimensions.forEach(dim => {
      dim.scores.forEach(s => {
        if (s.url) {
          const isGov = s.url.includes('.gov.cn') || s.url.includes('.gov.cn')
          const isOrg = s.url.includes('.org.cn') || s.url.includes('shgjj.com') || s.url.includes('bse.cn') || s.url.includes('shanghaiinvest.com')
          expect(isGov || isOrg).toBe(true)
        }
      })
    })
  })
})

/* ═══════ 画像权重测试 ═══════ */
describe('画像系统', () => {
  it('每个画像应有6维度权重', () => {
    personas.forEach(p => {
      expect(p.weights).toBeDefined()
      const keys = Object.keys(p.weights)
      expect(keys.length).toBe(6)
    })
  })

  it('画像权重之和应大于0', () => {
    personas.forEach(p => {
      const sum = Object.values(p.weights).reduce((a, b) => a + b, 0)
      expect(sum).toBeGreaterThan(0)
    })
  })
})
