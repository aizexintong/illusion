{{- /* 幻梦 Illusion v1.1.0 - 默认文章模板 - 正式预览版 */ -}}
{{- /* date: 文章创建日期，Hugo 自动填充为执行 hugo new 命令时的当前时间戳 */ -}}
{{- /* draft: 草稿状态标记，设为 true 时 Hugo 默认不会构建该页面，发布时需改为 false */ -}}
{{- /* title: 自动由文件名生成标题，将连字符替换为空格并将每个单词首字母大写 */ -}}
+++
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
+++
