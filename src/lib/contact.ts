/**
 * 全站统一联系方式配置（单一数据源）
 * 所有展示位置（Footer / 联系我们 / 岗位详情 / 投递抽屉）均从此处读取。
 */
export const contact = {
  /** 顾问姓名 */
  consultantName: '芷婷 Davina',
  /** 微信号 */
  wechat: 'DavinaLi7',
  /** 联系邮箱 */
  email: 'davina.lzt@x-giants.com',
  /** 微信二维码（本地静态资源，1:1，含 quiet zone） */
  wechatQr: '/images/davina-wechat-qr.png',
} as const;
