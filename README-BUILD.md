## CDN

### CNAME 配置

配置themes 下的 CNAME 文件
```yml
#./themes/hexo-theme-Claudia-master/source/CNAME
www.btcstudy.org
```

- 将 btc-study.github.io 指向到 www.btcstudy.org
- 将 btcstudy.org 重定向 到 www.btcstudy.org

### CDN 配置
```yml
#./_config.yml

cdn:
  enable: true
  base: //res.btcstudy.org/btcstudy/
  tags:
    'img[src]':
      attribute: src
      callback: >
        function(imgSrc) {
          return imgSrc.replace('//res.btcstudy.org/images', '//res.btcstudy.org/btcstudy/images')
        }
  excludeTags:
    - 'link'
    - 'script'
```

## 部署

更新 2023年01月12日14:35:23

部署方式调整，取消 travis-ci 自动构建，改为手动构建。

步骤：

1. 编写文章
2. 运行命令，生成静态文件
```bash
$ hexo g
```
3. 提交代码，部署完成

====== 分割线 =====

[仓库地址](https://github.com/btc-study/Bitcoin-ideas-Chinese-based-on-Nakamoto-Institute)

[travis-ci 自动化构建脚本](https://app.travis-ci.com/github/btc-study/Bitcoin-ideas-Chinese-based-on-Nakamoto-Institute)

部署方式:

main 分支提交更新, 触发 travis-ci 构建脚本, 自动构建代码到 gh-pages 分支发布 GitHub 静态页面
