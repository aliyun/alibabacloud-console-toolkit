# XConsole

## 开发

```bash
git clone [你的git仓库]
cd [你的本地目录]
tnpm i
npm run start -- --port 3333
```


#### 开发资料

相关开发资料:

开发框架： https://xconsole.aliyun-inc.com/develop/intro

组件库： https://wind.alibaba-inc.com

mocks: https://mocks.alibaba-inc.com/project/[你的产品]

## 发布

#### 预发

```bash
def p -d 
```

预发绑定地址：

```bash
100.67.79.188 [你的云产品code].console.aliyun.com
10.218.249.33 g.alicdn.com
```

修改 viper 上的版本号
[https://pre-vipernew.aliyun-inc.com/product/[你的产品]/conf](https://pre-vipernew.aliyun-inc.com/)

#### 线上

```bash
def p -o
```

修改 viper 上的版本号
[https://vipernew.aliyun-inc.com/product/[你的产品]/conf](https://vipernew.aliyun-inc.com/)

## 国际化

美杜莎： http://mds-portal.alibaba-inc.com/


## 稳定性

监控： https://stonehenge.aliyun-inc.com/apps/[你的产品code] （可以接入钉钉机器人报警）
