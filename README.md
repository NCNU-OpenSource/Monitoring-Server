# 更詳細的 Prometheus 指南 Reference！

- [The deinitive guide to prometheus in 2019](https://devconnected.com/the-definitive-guide-to-prometheus-in-2019/)

# Monitoring-Server
- [Slides](https://docs.google.com/presentation/d/1zxTj3459aKdXk7VoAY3JxPIpYj8YFihN2kO6Od0LBsY/edit?usp=sharing)

## 專案簡介
- 隨著部署/管理 伺服器的增加，對於一天只有24小時的猴子，無法實時知道伺服器的狀態，但隨著猴子的進化，還有更強大的猴子開發了強大的工具——「Prometheus」、「Grafana」。
    - - [x] 可針監控Service
    - - [x] 可監控伺服器狀況
    - - [x] 視覺化呈現監控結果
    - ……
- 手機不離手，搭配IM的使用，猴子的可用時間又多了一點！
    - - [x] Telegram Bot

### 科普
**Prometheus** 是一個基於 Golang 語言所撰寫的服務效能測量監控系統，透過 HTTP 協定從遠方機器收集數據，被監控的伺服器則需要安裝 exporter 來收集監控數據。

**Grafana** 是一個開源數據視覺化平台可搭配 Prometheus 使用。

## 安裝過程

### Prometheus
1. 下載並解壓縮 Prometheus 2.10
```shell=
wget https://github.com/prometheus/prometheus/releases/download/v2.10.0/prometheus-2.10.0.linux-amd64.tar.gz

tar xvfz prometheus-2.10.0.linux-amd64.tar.gz
cd prometheus-2.10.0.linux-amd64
```

2. 設定 prometheus.yml <增加監控點>
```shell=
# my global config
global:
  scrape_interval:     15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9090', 'localhost:9091', 'localhost:9100']
```
3. 執行 prometheus (背景執行)
```shell=
./prometheus --config.file=prometheus.yml
```
4. 訪問頁面
```
http://{YOUR_IP}:9090
```

### 監控 Node-exporter
1. 下載＆解壓縮
```shell=
wget https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.linux-amd64.tar.gz

tar xvfz node_exporter-0.18.1.linux-amd64.tar.gz
```

2. 執行
```
./node_exporter
```

3. 訪問頁面
```
http://{YOUR_IP}:9100
```

4. 將此 Node 加入 Prometheus 監控
    - 修改 prometheus.yml
    - 重起 Prometheus
```
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'
    scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9090'] # local prometheus

  - job_name: 'other'

    static_configs:
    - targets: ['localhost:9100'] # 監控 node_exporter
```

5. 到 Prometheus 查看監控的 targets
```
http://{YOUR_IP}:9090/targets
```

### Grafana

1. 下載並安裝 Grafana
```shell=
wget https://dl.grafana.com/oss/release/grafana_6.2.2_amd64.deb

sudo dpkg -i grafana_6.2.2_amd64.deb
```

:::info
- Installs configuration file to `/etc/grafana/grafana.ini`

- The default configuration sets the log file at `/var/log/grafana/grafana.log`

- The default configuration specifies an sqlite3 db at `/var/lib/grafana/grafana.db`
:::

2. 啟動 Grafana
```shell=
sudo service grafana-server start
```

3. 將 Grafana 設置為開機時啟動
```shell=
sudo update-rc.d grafana-server defaults
```

4. 訪問頁面
```
http://{YOUR_IP}:3000
```

5. 登入（預設 admin/admin）

6. Add Data Source(用來載入 Prometheus 的 data)
    - Configuration > Data Sources > Add data source > 選擇 Prometheus 的按鈕 > 填寫 HTTP URL > Save

7. 選個漂亮的 Dashboard!


### PushGateWay

1. 安裝
```shell=
wget https://github.com/prometheus/pushgateway/releases/download/v0.8.0/pushgateway-0.8.0.linux-amd64.tar.gz
tar -xvfz pushgateway-0.8.0.linux-amd64.tar.gz
cd pushgateway-0.8.0.linux-amd64
```
2. 啟動(背景執行)
```shell=
./pushgateway & 
```

3. 寫一個 bash 上傳 cpu / memory 資訊

#### 調整檔案權限
```shell=
touch {fileName} 
chmod u+x {fileName} 
vim {fileName} 
```


```bash=
#!/bin/bash
z=$(ps aux)
while read -r z
do
   var=$var$(awk '{print "cpu_usage{process=\""$11"\", pid=\""$2"\"}", $3z}');
done <<< "$z"
curl -X POST -H  "Content-Type: text/plain" --data "$var
" http://localhost:9091/metrics/job/cpu/instance/main_server
```

```bash=
#!/bin/bash
z=$(ps aux)
while read -r z
do
   var=$var$(awk '{print "memory_usage{process=\""$11"\", pid=\""$2"\"}", $4z}');
done <<< "$z"
curl -X POST -H  "Content-Type: text/plain" --data "$var
" http://localhost:9091/metrics/job/memory/instance/main_server
```

### Node_exporter
```bash=
## 下載
wget https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.linux-amd64.tar.gz
## 解壓縮
tar -zxvf node_exporter-0.18.1.linux-amd64.tar.gz
## 切換路徑
cd node_exporter-0.18.1.linux-amd64
## 執行 node_exporter
./node_exporter &
```

### AlertManager(未使用到)
```bash=
wget https://github.com/prometheus/alertmanager/releases/download/v0.17.0/alertmanager-0.17.0.linux-amd64.tar.gz

tar -zxvf alertmanager-0.17.0.linux-amd64.tar.gz

cd alertmanager-0.17.0.linux-amd64

./alertmanager &
```

## 範例 API
方便檢測監控 server 的 CPU/Memory 使用狀況

### express_sample
- {YOUR_IP}:3001/ ： 簡單 hash 計算
- {YOUR_IP}:3001/mem ： 使用 Buffer 佔用記憶體空間

### Install & Usage
```
npm install

cd ./express_sample

node index.js
```


### autocannon
壓力測試

#### Install
```
npm install autocannon -g
```

#### Use

```
autocannon -c 100 -d 10 -p 2 http://127.0.0.1:3001/
```

參數說明
```
-c/--connections NUM
    The number of concurrent connections to use. default: 10.
-p/--pipelining NUM
    The number of pipelined requests to use. default: 1.
-d/--duration SEC
    The number of seconds to run the autocannnon. default: 10.
-m/--method
    HTTP METHOD
-b/--body BODY
    The body of the request.
	Note: This option needs to be used with the '-H/--headers' option in some frameworks
```


## 分工
- [王俊傑]()：部署環境、測試可行性、接 Telegram Bot API
- [李禹叡]()：共同 Study PromQL、Prometheuse、壓力測試
- [覃融亮]()：共同 Study PromQL、Prometheuse、壓力測試

## Reference

[Prometheuse 官網](https://prometheus.io)
- `Offical`

[K8s + Prometheus](https://tpu.thinkpower.com.tw/tpu/articleDetails/992)
- `基礎概念`

[Prometheus 配置](https://songjiayang.gitbooks.io/prometheus/content/configuration/global.html)

[K8s + Prometheus](https://medium.com/getamis/kubernetes-operators-prometheus-3584edd72275)
- `基礎概念`

[Node.js + Prometheus](https://medium.com/the-node-js-collection/node-js-performance-monitoring-with-prometheus-c3d50c2d5608)
- `Node.js`、`監控 HTTP`

[Prometheus + node_exporter + grafana + mail notify](https://blog.51cto.com/youerning/2050543)
- `安裝教學 2017`、`不美觀 Mail`

[Prometheus + node_exporter + grafana](https://site-optimize-note.tk/伺服器效能監控prometheus-與-grafana-安裝教學/)
- `安裝教學 2018`、`有系列`

[IBM - Prometheus 入门与实践](https://www.ibm.com/developerworks/cn/cloud/library/cl-lo-prometheus-getting-started-and-practice/index.html)

[常用的 Stress / Performance 工具 – Benjr.tw](http://benjr.tw/532)

[Monitoring Linux Processes using Prometheus and Grafana](https://medium.com/schkn/monitoring-linux-processes-using-prometheus-and-grafana-113b3e271971)

