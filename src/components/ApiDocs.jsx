export default function ApiDocs() {
  const endpoints = [
    { method: 'GET', path: '/api/v1/policies', desc: '获取政策列表', params: 'dimension, region, status' },
    { method: 'GET', path: '/api/v1/impact-score', desc: '计算政策影响指数', params: 'persona, region' },
    { method: 'GET', path: '/api/v1/news', desc: '获取新闻联播政策速递', params: 'date, dimension' },
    { method: 'GET', path: '/api/v1/deadlines', desc: '获取政策截止日期', params: 'persona' },
    { method: 'GET', path: '/api/v1/topics', desc: '获取场景化专题', params: 'persona, region' },
  ]
  return (
    <div className="api-docs">
      <h2 className="section-title">🔌 政策数据 API</h2>
      <p className="api-intro">面向企业客户和开发者，提供结构化政策数据接口。适用于房产中介、金融机构、企业HR、政策研究机构。</p>
      <div className="api-pricing">
        <div className="api-plan"><span className="ap-name">体验版</span><span className="ap-price">免费</span><span className="ap-limit">100次/月</span></div>
        <div className="api-plan"><span className="ap-name">标准版</span><span className="ap-price">¥500/月</span><span className="ap-limit">10,000次/月</span></div>
        <div className="api-plan"><span className="ap-name">企业版</span><span className="ap-price">¥5,000/月</span><span className="ap-limit">无限调用</span></div>
      </div>
      <div className="api-endpoints">
        {endpoints.map((ep, i) => (
          <div key={i} className="api-ep">
            <span className={`api-method api-${ep.method.toLowerCase()}`}>{ep.method}</span>
            <code className="api-path">{ep.path}</code>
            <span className="api-desc">{ep.desc}</span>
            <span className="api-params">参数: {ep.params}</span>
          </div>
        ))}
      </div>
      <div className="api-cta">
        <p>📧 商务合作请联系：<a href="mailto:api@policycompass.app">api@policycompass.app</a></p>
      </div>
    </div>
  )
}