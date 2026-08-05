{{- /* 幻梦 Illusion v1.1.0 - 默认文章模板 - 正式预览版 */ -}}
+++
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
+++
