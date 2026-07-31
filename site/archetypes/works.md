---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
year: {{ .Date.Format "2006" }}
ref: ""
series: ""
location: ""
medium: ""
dimensions: ""
edition: ""
availability: "not-for-sale"   # for-sale | sold | reserved | not-for-sale
category: ""
featured: false
weight: 1
image: "cover.jpg"             # cover image in this bundle
---
