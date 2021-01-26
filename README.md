# paypal-node
为了使用paypal支付简单，把支付相关的接口进行了封装，支持在ts和js中使用。

## 安装
`yarn add paypal-node`

## 创建对象
```bash
const Paypal = require('paypal-node')
const paypal = new Paypal({
    client_id: '在开发者平台获取',
    secret: '在开发者平台获取',
    sandbox: true # true 启用沙箱
});
```

## 使用
1. 创建订单
```bash
const result = await paypal.create_order({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: +new Date() + '',
            amount: {
              currency_code: 'USD',
              value: '1.00',
            },
            description: '支付测试',
          },
        ],
        application_context: {
          return_url: '支付成功要进入的页面',
          cancel_url: '取消支付要进入的页面',
        },
      });
# 拉起支付的链接 https://www.sandbox.paypal.com/checkoutnow?token=${result.data.id}
# result.data.id 即paypal 返回的订单ID
```
2. 查询订单
```bash
const result = await paypal.detail_order('paypal 返回的订单ID');
```
3. 修改订单
```bash
# 1611629973644 是创建订单中的reference_id
const result = await paypal.update_order('paypal 返回的订单ID', [
    {
      op: 'add',
      path: "/purchase_units/@reference_id=='1611629973644'/shipping/address",
      value: {
        address_line_1: '123 Townsend St',
        address_line_2: 'Floor 6 9993',
        admin_area_2: 'San Francisco',
        admin_area_1: 'CA',
        postal_code: '94107',
        country_code: 'US',
      },
    },
  ]);
```
4. 捕获订单付款(真正支付成功，钱从用户到商户账号中)
```bash
const result = await paypal.capture_order_pay('paypal 返回的订单ID');
# console.log(result.data.purchase_units[0].payments) // 返回退款需要的capture_id
# 也可以再次调用detail_order 获取capture_id
```
5. 显示捕获的付款明细
```bash
const result = await paypal.payments_captures('capture_id');
```
6. 退还已捕获的付款 (退款)
```bash
const result = await paypal.payments_captures_refund('capture_id', {
    amount: {
      currency_code: 'USD',
      value: '1.00',
    },
    invoice_id: +new Date() + '',
    note_to_payer: '退款',
  });
  # result.data.id 是refund_id 即退款ID
```
7. 查询退款
```bash
const result = await paypal.payments_refund('refund_id');
```

* 注意
1. 回调地址设置: 在SANDBOX WEBHOOKS下添加，选择Checkout order approved 方式接收支付成功回调
2. paypal 费用特别高，每单收取超过30%

## 文档
[PayPal开发者网站](https://developer.paypal.com/docs/nvp-soap-api/)
[沙箱账号登录](https://www.sandbox.paypal.com/c2/signin)