# Timestamp Format Test

这个文件用于测试不同格式的时间戳如何与视频播放器互动。

## VTT格式时间戳 (00:00:01.919)

在VTT文件中，时间戳格式包含毫秒：`00:00:01.919`

## Markdown格式时间戳 (00:22:45)

在Markdown中，时间戳格式通常没有毫秒：`00:22:45`

## 测试各种格式

### 标准格式 (无转义)

1. [00:00:00] - 视频开始：Did you know that ambush predators tend
2. [00:01:00] - 一分钟标记：This would be where the film will be or the receptors
3. [00:03:00] - 三分钟标记：mystery what exactly they're using that eye for

### 转义格式

1. \[00:00:20\] - 转义格式：light onto the retina and forms an image
2. \[00:01:30\] - 转义格式：Octopus have chambered eye type and in
3. \[00:02:45\] - 转义格式：Mantis shrimp one of the most bizarre animals

### 括号格式

1. (00:00:10) - 括号格式：Behind which we have the optical system
2. (00:00:40) - 括号格式：they do have a centralized nervous system
3. (00:02:00) - 括号格式：and they're super fast

### 短格式 (分:秒)

1. [02:30] - 短格式没有小时：Splitting the job into different parts
2. [04:15] - 短格式：acuity and give you lots of detailed information

### 毫秒格式

1. [00:00:01.919] - 带毫秒：Did you know that ambush predators tend
2. [00:03:30.500] - 带毫秒：directly onto the retina

## 结论

这个测试文件包含了各种格式的时间戳，用于验证哪些格式可以与视频播放器正确互动。 