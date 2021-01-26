'use strict';
import request from 'superagent';
interface Ipaypal {
  client_id: string;
  secret: string;
  sandbox?: boolean;
}
interface Ioptions {
  sandbox?: boolean;
}
interface Irequest {
  method: string;
  data?: object | Array<object>;
  url: string;
  query?: object;
}
class Paypal {
  private client_id: string;
  private secret: string;
  private sandbox = false;
  private prefix_url = 'https://api-m.paypal.com';
  constructor(client_id: string, secret: string, options?: Ioptions);
  constructor(params: Ipaypal);
  constructor(arg: Ipaypal | string, secret?: string, options?: Ioptions) {
    if (arg instanceof Object) {
      this.client_id = arg.client_id;
      this.secret = arg.secret;
      this.sandbox = arg.sandbox || false;
    } else {
      this.client_id = arg;
      this.secret = secret || '';
      if (options) {
        this.sandbox = options.sandbox || false;
      }
    }
    if (this.sandbox) this.prefix_url = 'https://api-m.sandbox.paypal.com';
  }
  // 请求
  public async _request(params: Irequest, access_token?: string): Promise<object> {
    try {
      const method = params.method.toLowerCase();
      let _request: any;
      switch (method) {
        case 'post':
          _request = request.post(`${this.prefix_url}${params.url}`);
          break;
        case 'patch':
          _request = request.patch(`${this.prefix_url}${params.url}`);
          break;
        case 'get':
          _request = request.get(`${this.prefix_url}${params.url}`);
          break;
        default:
          throw '请求方式有误';
      }
      _request.set({
        Accept: 'application/json',
        ...(access_token && {Authorization: `Bearer ${access_token}`}),
        'Content-Type': 'application/json',
      });
      if (!access_token) _request.auth(this.client_id, this.secret);
      if (params.data) _request.send(params.data);
      if (params.query) _request.query(params.query);
      const result = await _request;
      return {
        status: result.status,
        data: result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      if (!(err instanceof Object)) {
        return {
          data: {message: error},
          status: 400,
        };
      }
      return {
        status: err.status,
        data: JSON.parse(err.response.text),
      };
    }
  }
  // 获取token
  public async getToken(): Promise<object> {
    try {
      const url = '/v1/oauth2/token';
      const result = await request
        .post(`${this.prefix_url}${url}`)
        .auth(this.client_id, this.secret)
        .set({
          Accept: 'application/json',
          'Accept-Language': 'en_US',
        })
        .type('form')
        .send({grant_type: 'client_credentials'});
      return {
        status: result.status,
        data: result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        data: JSON.parse(err.response.text),
      };
    }
  }
  // 创建订单
  public async create_order(params: object, access_token?: string): Promise<object> {
    const result = await this._request(
      {
        method: 'post',
        url: '/v2/checkout/orders',
        data: params,
      },
      access_token
    );

    return result;
  }
  // 修改订单
  public async update_order(
    orderid: string,
    params: Array<object>,
    access_token?: string
  ): Promise<object> {
    const result = await this._request(
      {
        method: 'patch',
        url: `/v2/checkout/orders/${orderid}`,
        data: params,
      },
      access_token
    );

    return result;
  }
  // 订单明细
  public async detail_order(
    orderid: string,
    query: object = {},
    access_token?: string
  ): Promise<object> {
    const result = await this._request(
      {
        method: 'get',
        url: `/v2/checkout/orders/${orderid}`,
        query: query,
      },
      access_token
    );

    return result;
  }
  // 捕获订单付款
  public async capture_order_pay(
    orderid: string,
    params: object = {},
    access_token?: string
  ): Promise<object> {
    const result = await this._request(
      {
        method: 'post',
        url: `/v2/checkout/orders/${orderid}/capture`,
        data: params,
      },
      access_token
    );

    return result;
  }
  // 显示捕获的付款明细
  public async payments_captures(capture_id: string, access_token?: string): Promise<object> {
    const result = await this._request(
      {
        method: 'get',
        url: `/v2/payments/captures/${capture_id}`,
      },
      access_token
    );

    return result;
  }
  // 退还已捕获的付款
  public async payments_captures_refund(
    capture_id: string,
    params: object = {},
    access_token?: string
  ): Promise<object> {
    const result = await this._request(
      {
        method: 'post',
        url: `/v2/payments/captures/${capture_id}/refund`,
        data: params,
      },
      access_token
    );

    return result;
  }
  // 查询退款信息
  public async payments_refund(refund_id: string, access_token?: string): Promise<object> {
    const result = await this._request(
      {
        method: 'get',
        url: `/v2/payments/refunds/${refund_id}`,
      },
      access_token
    );

    return result;
  }
}
export = Paypal;
