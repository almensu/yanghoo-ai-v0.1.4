
# 如果输出太长，导入 md
```bash
yt-dlp --dump-json  https://www.youtube.com/watch?v=kYfNvmF0Bqw  | jq > 输出文件名.md
```

简体中文 Chinese (Simplified)


# youtube 的 json
```bash
yt-dlp --dump-json  https://www.youtube.com/watch?v=kYfNvmF0Bqw  | jq


{
  "id": "kYfNvmF0Bqw",
  "title": "Steve Jobs Secrets of Life",
  "formats": [
    {
      "format_id": "sb3",
      "format_note": "storyboard",
      "ext": "mhtml",
      "protocol": "mhtml",
      "acodec": "none",
      "vcodec": "none",
      "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L0/default.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLDJltFiypFqKn9kfLce6uYHzvhW0A",
      "width": 48,
      "height": 27,
      "fps": 1.0,
      "rows": 10,
      "columns": 10,
      "fragments": [
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L0/default.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLDJltFiypFqKn9kfLce6uYHzvhW0A",
          "duration": 100.0
        }
      ],
      "audio_ext": "none",
      "video_ext": "none",
      "vbr": 0,
      "abr": 0,
      "tbr": null,
      "resolution": "48x27",
      "aspect_ratio": 1.78,
      "filesize_approx": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "sb3 - 48x27 (storyboard)"
    },
    {
      "format_id": "sb2",
      "format_note": "storyboard",
      "ext": "mhtml",
      "protocol": "mhtml",
      "acodec": "none",
      "vcodec": "none",
      "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L1/M$M.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLDYs9_vbHrZgvvMzsIjwYGFkjwPVw",
      "width": 81,
      "height": 45,
      "fps": 1.01,
      "rows": 10,
      "columns": 10,
      "fragments": [
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L1/M0.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLDYs9_vbHrZgvvMzsIjwYGFkjwPVw",
          "duration": 99.00990099009901
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L1/M1.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLDYs9_vbHrZgvvMzsIjwYGFkjwPVw",
          "duration": 0.9900990099009874
        }
      ],
      "audio_ext": "none",
      "video_ext": "none",
      "vbr": 0,
      "abr": 0,
      "tbr": null,
      "resolution": "81x45",
      "aspect_ratio": 1.8,
      "filesize_approx": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "sb2 - 81x45 (storyboard)"
    },
    {
      "format_id": "sb1",
      "format_note": "storyboard",
      "ext": "mhtml",
      "protocol": "mhtml",
      "acodec": "none",
      "vcodec": "none",
      "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L2/M$M.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLAUVVfqKihN7l46t97eRN8ncHf8XA",
      "width": 163,
      "height": 90,
      "fps": 1.01,
      "rows": 5,
      "columns": 5,
      "fragments": [
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L2/M0.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLAUVVfqKihN7l46t97eRN8ncHf8XA",
          "duration": 24.752475247524753
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L2/M1.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLAUVVfqKihN7l46t97eRN8ncHf8XA",
          "duration": 24.752475247524753
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L2/M2.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLAUVVfqKihN7l46t97eRN8ncHf8XA",
          "duration": 24.752475247524753
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L2/M3.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLAUVVfqKihN7l46t97eRN8ncHf8XA",
          "duration": 24.752475247524753
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L2/M4.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLAUVVfqKihN7l46t97eRN8ncHf8XA",
          "duration": 0.9900990099009874
        }
      ],
      "audio_ext": "none",
      "video_ext": "none",
      "vbr": 0,
      "abr": 0,
      "tbr": null,
      "resolution": "163x90",
      "aspect_ratio": 1.81,
      "filesize_approx": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "sb1 - 163x90 (storyboard)"
    },
    {
      "format_id": "sb0",
      "format_note": "storyboard",
      "ext": "mhtml",
      "protocol": "mhtml",
      "acodec": "none",
      "vcodec": "none",
      "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M$M.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
      "width": 327,
      "height": 180,
      "fps": 1.01,
      "rows": 3,
      "columns": 3,
      "fragments": [
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M0.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M1.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M2.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M3.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M4.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M5.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M6.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M7.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M8.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M9.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M10.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 8.910891089108912
        },
        {
          "url": "https://i.ytimg.com/sb/kYfNvmF0Bqw/storyboard3_L3/M11.jpg?sqp=-oaymwENSDfyq4qpAwVwAcABBqLzl_8DBgirutioBg==&sigh=rs$AOn4CLD4xVmAA7M5pZi91t0d0hQ5rFcawQ",
          "duration": 1.9801980198019749
        }
      ],
      "audio_ext": "none",
      "video_ext": "none",
      "vbr": 0,
      "abr": 0,
      "tbr": null,
      "resolution": "327x180",
      "aspect_ratio": 1.82,
      "filesize_approx": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "sb0 - 327x180 (storyboard)"
    },
    {
      "format_id": "233",
      "format_note": "Default",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/233/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/goi/133/sgoap/clen%3D608659%3Bdur%3D99.706%3Bgir%3Dyes%3Bitag%3D139%3Blmt%3D1646449574643642/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,goi,sgoap,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRgIhAKS1b9IIYJVkXA16d7ztXv-2FD0yqb-sliXlHBDmyL9bAiEA1WQUp9pPJWs0wrvTei8XC5lgxwwZGkNvVMJD_Qu8OSI%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRQIgFz067SHkPno73OBlu34ZNWESNPUcUYhB277xLhjHFN0CIQDb93HaF50QA-jrb12lm3syk4bdlMAEKeh8K_E2GJ2dAw%3D%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "language": "en",
      "ext": "mp4",
      "protocol": "m3u8_native",
      "preference": null,
      "quality": -1,
      "has_drm": false,
      "vcodec": "none",
      "source_preference": -1,
      "audio_ext": "mp4",
      "video_ext": "none",
      "vbr": 0,
      "abr": null,
      "tbr": null,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "233 - audio only (Default)"
    },
    {
      "format_id": "234",
      "format_note": "Default",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/234/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/goi/133/sgoap/clen%3D1613177%3Bdur%3D99.636%3Bgir%3Dyes%3Bitag%3D140%3Blmt%3D1646449574346262/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,goi,sgoap,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRQIhAIZP8Sk2hpLV6ICXlzyDUJmc9Yq9wl7azLrexX-hJLo7AiBnWGTzwHtK-8URYUHw7xgIY4EjnCW6YtfkOqO68TjBzA%3D%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRgIhAJiKbEmOGoQr9VG9oRs3B_eHEG3qBqb2o4_qrKP05wTIAiEAqUbXRpdGLjfiWSQCkhq1ofLrjnn9olTBDNn9w_6-HTs%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "language": "en",
      "ext": "mp4",
      "protocol": "m3u8_native",
      "preference": null,
      "quality": -1,
      "has_drm": false,
      "vcodec": "none",
      "source_preference": -1,
      "audio_ext": "mp4",
      "video_ext": "none",
      "vbr": 0,
      "abr": null,
      "tbr": null,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "234 - audio only (Default)"
    },
    {
      "asr": 22050,
      "filesize": 608659,
      "format_id": "139-drc",
      "format_note": "low, DRC",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 1.5,
      "has_drm": false,
      "tbr": 48.836,
      "filesize_approx": 608655,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=139&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=608659&dur=99.706&lmt=1656243212341746&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgc7tXBs46NydxWUTlHeE2FKtlhBmvgxwwE0TWWPR571kCIHQDgsecIddK9sZXsW7EK4fsxXzydgindWQ2lNqC0PrX&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "m4a",
      "vcodec": "none",
      "acodec": "mp4a.40.5",
      "dynamic_range": null,
      "container": "m4a_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 48.836,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "139-drc - audio only (low, DRC)"
    },
    {
      "asr": 48000,
      "filesize": 553693,
      "format_id": "249-drc",
      "format_note": "low, DRC",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 1.5,
      "has_drm": false,
      "tbr": 44.472,
      "filesize_approx": 553681,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=249&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=553693&dur=99.601&lmt=1656243204525322&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAP_yy8zStey6ndrjhEfofeBY94cPfnBXE4O6zFY5xYSBAiEAwrH9huwx37x64MidSyTov_Tbd2M9I0US8wsN9nHGkQs%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 44.472,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "249-drc - audio only (low, DRC)"
    },
    {
      "asr": 48000,
      "filesize": 669865,
      "format_id": "250-drc",
      "format_note": "low, DRC",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 1.5,
      "has_drm": false,
      "tbr": 53.803,
      "filesize_approx": 669854,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=250&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=669865&dur=99.601&lmt=1656243206601615&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgA6bejGXWUXxzfAYy7PhR7X8HXEW5eRxYii8ZHAk_qysCIQC64OhzXjZtdOLd2RZqfgulvzF1Hr6WlgUdLKKusRszdg%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 53.803,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "250-drc - audio only (low, DRC)"
    },
    {
      "asr": 22050,
      "filesize": 608659,
      "format_id": "139",
      "format_note": "low",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 2.0,
      "has_drm": false,
      "tbr": 48.836,
      "filesize_approx": 608655,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=139&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=608659&dur=99.706&lmt=1646449574643642&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgOHaPR8s80U7xfoZhas9YUzYgQbTwa35oyKQTK5L1OsQCIQCWiFSfjS_u9a7lo10Z9SrXrDQcWP4YgWchyqEPfW9VDg%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "m4a",
      "vcodec": "none",
      "acodec": "mp4a.40.5",
      "dynamic_range": null,
      "container": "m4a_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 48.836,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "139 - audio only (low)"
    },
    {
      "asr": 48000,
      "filesize": 562230,
      "format_id": "249",
      "format_note": "low",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 2.0,
      "has_drm": false,
      "tbr": 45.158,
      "filesize_approx": 562222,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=249&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=562230&dur=99.601&lmt=1646449579184905&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAOzYBtPLYIaaZeLpUvvKybl96ZbgywRXqV4QqsQQyY-OAiEAkTMRD-SD-jIGQiOOG3aw3GmcLLzLbb7xTvTPCPOWg94%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 45.158,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "249 - audio only (low)"
    },
    {
      "asr": 48000,
      "filesize": 643617,
      "format_id": "250",
      "format_note": "low",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 2.0,
      "has_drm": false,
      "tbr": 51.695,
      "filesize_approx": 643609,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=250&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=643617&dur=99.601&lmt=1646449575131089&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgYA6ytPQn0mtnUT0bjibRdTHEmu0rQm1axnBDZJyzIDYCIF-npkocIF_CE-9ufybySLYTSNZ6Wh6WATY1Bdx5qoJv&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 51.695,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "250 - audio only (low)"
    },
    {
      "asr": 44100,
      "filesize": 1613177,
      "format_id": "140-drc",
      "format_note": "medium, DRC",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 2.5,
      "has_drm": false,
      "tbr": 129.525,
      "filesize_approx": 1613169,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=1613177&dur=99.636&lmt=1656243212656542&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgLbWUMZ8ulrqJS8aF7Ot4fDe8QMqOnOiR1ytwXPapfKkCIQC-5fbJTH68mGBXYcKBRzeJuuMmtCM--i37k9Iz2nuLoQ%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "m4a",
      "vcodec": "none",
      "acodec": "mp4a.40.2",
      "dynamic_range": null,
      "container": "m4a_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 129.525,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "140-drc - audio only (medium, DRC)"
    },
    {
      "asr": 48000,
      "filesize": 1133505,
      "format_id": "251-drc",
      "format_note": "medium, DRC",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 2.5,
      "has_drm": false,
      "tbr": 91.043,
      "filesize_approx": 1133496,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=251&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=1133505&dur=99.601&lmt=1656243207471565&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgavlu2ZwPxL0Xs8RNbOq11CJljzaIIulcM_n0w6qAwHICIQDPZaWGsj4-yB3BaO9BllkQS9PYvYkkPi8NO9b1qtnqWg%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 91.043,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "251-drc - audio only (medium, DRC)"
    },
    {
      "asr": 44100,
      "filesize": 1613177,
      "format_id": "140",
      "format_note": "medium",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 3.0,
      "has_drm": false,
      "tbr": 129.525,
      "filesize_approx": 1613169,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=1613177&dur=99.636&lmt=1646449574346262&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgIaJDKjuXVgprE9I49xWY2qEIY_CAmxX136WdWel-F-ECIQDlTAxHI-CACCjo3473Bk2ujPdMhQAfc4olhLWqhVFBtA%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "m4a",
      "vcodec": "none",
      "acodec": "mp4a.40.2",
      "dynamic_range": null,
      "container": "m4a_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 129.525,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "140 - audio only (medium)"
    },
    {
      "asr": 48000,
      "filesize": 1089692,
      "format_id": "251",
      "format_note": "medium",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 3.0,
      "has_drm": false,
      "tbr": 87.524,
      "filesize_approx": 1089684,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=251&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=1089692&dur=99.601&lmt=1646449573912384&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgG7x6MIMld9HOcqebtQ6e4JX5Vjk-ZLNuLY2EmjtaSAICIFa5qzk0ITDyILZqtO2GmSyjN1-29QMDxSFxJIGNgsej&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 87.524,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "251 - audio only (medium)"
    },
    {
      "format_id": "602",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/602/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/wft/1/sgovp/clen%3D290527%3Bdur%3D99.498%3Bgir%3Dyes%3Bitag%3D598%3Blmt%3D1646449969783679/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,wft,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRQIgSQDZSCPk9wL6MsS02ApiDtXGRu7Nw_0gLDGwcxrf_joCIQCEIuffpFkjsq2nV5A8vlq2lDFY6CNyyRBpXgCN0X_DPA%3D%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRQIgG-deuamTZspBICZOod70V4e9V1tSopqjYq6DgJkWj_4CIQDD0eYoPYSMQpJ5JXUq79QLzDOsEE4xs89hsY2zPItzqg%3D%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 82.857,
      "ext": "mp4",
      "fps": 15.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 0,
      "has_drm": false,
      "width": 256,
      "height": 144,
      "vcodec": "vp09.00.10.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 82.857,
      "resolution": "256x144",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "602 - 256x144"
    },
    {
      "format_id": "269",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/269/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/sgovp/clen%3D357042%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D160%3Blmt%3D1646449966924264/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRAIgYwNU2AxuzxrAiok77JwWUiTYDPh_7AjsbKV61yHyDioCIDwbSt4_sjMqR_c-KLVruEycui7maqslDVICst3u50qz/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRQIhAKoo-Es8a9fCQx_HL0-0Q-lcZvmHBjlRdGBHwy7ZQ_UQAiB9aI9RfGQrB58Mz7r8YN1OLdlQ5F15LdJOIUqfvZbDgA%3D%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 101.375,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 0,
      "has_drm": false,
      "width": 256,
      "height": 144,
      "vcodec": "avc1.4D400C",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 101.375,
      "resolution": "256x144",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "269 - 256x144"
    },
    {
      "asr": null,
      "filesize": 357042,
      "format_id": "160",
      "format_note": "144p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 144,
      "quality": 0.0,
      "has_drm": false,
      "tbr": 28.697,
      "filesize_approx": 357033,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=160&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=357042&dur=99.532&lmt=1646449966924264&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAL5kvKrOCl0XqIw0hcc3sC73l-EuAxc9lvsJUtTXq_bCAiBKNNd4AkiOKr_ePsBLhBP7oAtoHepW7y9IEbPKX-7oIQ%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 256,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "avc1.4D400C",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 28.697,
      "resolution": "256x144",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "160 - 256x144 (144p)"
    },
    {
      "format_id": "603",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/603/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/wft/1/sgovp/clen%3D867949%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D278%3Blmt%3D1646451070328140/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,wft,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRQIgSE2MEnyOdZw6Gbcwi7ZlwbeFSAOM3ji-NzSf6ia-hI4CIQCkC94NHQpSxPasaO4Lt6-kqD7dqw56jCo7b1SwrbONlQ%3D%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRQIhAKofONpMfyH1_V198dfBlALi1PPjy2xUvMfkejigkrNYAiBFY_6VM9APaWSBg_X1ZbhY5s-XlSN69geNiMv8lYOeaw%3D%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 139.196,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 0,
      "has_drm": false,
      "width": 256,
      "height": 144,
      "vcodec": "vp09.00.11.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 139.196,
      "resolution": "256x144",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "603 - 256x144"
    },
    {
      "asr": null,
      "filesize": 867949,
      "format_id": "278",
      "format_note": "144p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 144,
      "quality": 0.0,
      "has_drm": false,
      "tbr": 69.762,
      "filesize_approx": 867943,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=278&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=867949&dur=99.532&lmt=1646451070328140&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgM-vZZ4A9CyMypVsdoaUrNNg_SVXEoq04sBQMF72pmCQCIQDQnjK2n6mBJn2mN6r2L6YbLyWvfN9i9ApxX8zIZb6PuA%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 256,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "vp09.00.11.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "webm",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 69.762,
      "resolution": "256x144",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "278 - 256x144 (144p)"
    },
    {
      "asr": null,
      "filesize": 749977,
      "format_id": "394",
      "format_note": "144p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 144,
      "quality": 0.0,
      "has_drm": false,
      "tbr": 60.28,
      "filesize_approx": 749973,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=394&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=749977&dur=99.532&lmt=1646449946667578&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhALhANOAXemxbHnmnZOv_tYJwwPW0MbJHoQ1YPHdrKCj6AiAKXcU3FWZYyobb3JrwQ4gKh5C9ReapTLtdh_XdiLpJzg%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 256,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "av01.0.00M.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 60.28,
      "resolution": "256x144",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "394 - 256x144 (144p)"
    },
    {
      "format_id": "229",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/229/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/sgovp/clen%3D658887%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D133%3Blmt%3D1646449967619054/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRQIhAPdXFd5YtOKOMII3aI8DKEExhoMLBAWYHJG4w__eG2oAAiAcLU3mi1mjM90NtuQck9LL2gxKoQnqf_bbfKuFH0QAZw%3D%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wQwIfDf3u4AZ8LixXePhfka4kBkbijrGunRoWjz9Am38_pQIgdTYR29WEI8bHfEGoS3m6Kbbtb3ej27SfbaJg636oW-8%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 147.838,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 5,
      "has_drm": false,
      "width": 426,
      "height": 240,
      "vcodec": "avc1.4D4015",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 147.838,
      "resolution": "426x240",
      "aspect_ratio": 1.77,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "229 - 426x240"
    },
    {
      "asr": null,
      "filesize": 658887,
      "format_id": "133",
      "format_note": "240p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 240,
      "quality": 5.0,
      "has_drm": false,
      "tbr": 52.958,
      "filesize_approx": 658876,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=133&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=658887&dur=99.532&lmt=1646449967619054&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgQDN1ZkYhr3p-h7SOOpgDOPJQmJIaC7MG-9f2WaQLYQsCIGB-w2v8Oaa6d6uyCe1dL8Lxgu9kA76v4WlUBrbcR_Hz&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 426,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "avc1.4D4015",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 52.958,
      "resolution": "426x240",
      "aspect_ratio": 1.77,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "133 - 426x240 (240p)"
    },
    {
      "format_id": "604",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/604/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/wft/1/sgovp/clen%3D997255%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D242%3Blmt%3D1646451070661339/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,wft,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRQIhAOb3hA4CqDIdASYy8dlkdamz8nie6Ut9Z5-ehIdJl4VrAiBvONT1ZSC4iMWCyOXlwDP-UHyaN7l_Mqy2IAUa5_uM1w%3D%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRQIgTvh1aksQ47rWI9tRzGxxEsPtsYd1q9cYp0EDjRhNUiwCIQCDKKVxVtfsRIYm6CoMJpXIBrfg3QmHx-klJvJeAxgeEg%3D%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 192.007,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 5,
      "has_drm": false,
      "width": 426,
      "height": 240,
      "vcodec": "vp09.00.20.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 192.007,
      "resolution": "426x240",
      "aspect_ratio": 1.77,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "604 - 426x240"
    },
    {
      "asr": null,
      "filesize": 997255,
      "format_id": "242",
      "format_note": "240p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 240,
      "quality": 5.0,
      "has_drm": false,
      "tbr": 80.155,
      "filesize_approx": 997248,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=242&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=997255&dur=99.532&lmt=1646451070661339&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgbFClvC-_fFwnc3aNISf_cXWMm32tudJPv3pRBGEGhbECIGHb80TD5WH1zVgvZ2fh-0z89yDcheVsWALzPgwSRvnJ&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 426,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "vp09.00.20.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "webm",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 80.155,
      "resolution": "426x240",
      "aspect_ratio": 1.77,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "242 - 426x240 (240p)"
    },
    {
      "asr": null,
      "filesize": 858425,
      "format_id": "395",
      "format_note": "240p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 240,
      "quality": 5.0,
      "has_drm": false,
      "tbr": 68.996,
      "filesize_approx": 858413,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=395&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=858425&dur=99.532&lmt=1646449987766097&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgWwya6cPD0eUH5gMmkNyRRFCtbydKkWyl15xjjWN7basCICQ8rfqwu4eG4XtLvU1yPAP-Iu1B1HBL0HJ8hiElXs4H&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 426,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "av01.0.00M.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 68.996,
      "resolution": "426x240",
      "aspect_ratio": 1.77,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "395 - 426x240 (240p)"
    },
    {
      "format_id": "230",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/230/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/sgovp/clen%3D1188886%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D134%3Blmt%3D1646449970625560/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRAIgW1U1FEBYtL0KdOBcT9SjsF7ngMfmmhWUK3SdSThpLaoCIEzNbo-N1Id8jHa-oY033bxYiox--8J1p0jaGCovKCJ6/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRgIhANpiRlKlIge7Eg4uD5BRGXJ1gLcqT6Km6vtiVRbiW3HjAiEAujtE1fn-_prCa81YE0DwPYSkaP1JqKtrfcXGfyS-sD0%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 309.828,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 6,
      "has_drm": false,
      "width": 640,
      "height": 360,
      "vcodec": "avc1.4D401E",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 309.828,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "230 - 640x360"
    },
    {
      "asr": null,
      "filesize": 1188886,
      "format_id": "134",
      "format_note": "360p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 360,
      "quality": 6.0,
      "has_drm": false,
      "tbr": 95.558,
      "filesize_approx": 1188884,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=134&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=1188886&dur=99.532&lmt=1646449970625560&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgTtcDSbINlgIT87oGWTE1rrtrKiWjoL8sTtAcoxuOuKMCIG1SPSTRzYS3F37mO9FRBxKc4N1TTErD4RdcSmwUEvJk&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 640,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "avc1.4D401E",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 95.558,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "134 - 640x360 (360p)"
    },
    {
      "format_id": "605",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/605/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/wft/1/sgovp/clen%3D1951223%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D243%3Blmt%3D1646451069245258/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,wft,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRgIhAJJDQirGFEzpmdxJwct1Vuen2aA_3If9rRr0jjbomYNAAiEAsbzw9kwE-Odro2aolciVsXcJbedo58zLiuS0X92U91E%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRgIhAP8IjWXfTRWcLMZWlIkWoyYLQgPWzIarQh_2Ey2rs5ZUAiEAzAKrlCgQiyiSBrxQC7Zz3XjVvuUXevt4kif70bDrBbk%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 405.287,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 6,
      "has_drm": false,
      "width": 640,
      "height": 360,
      "vcodec": "vp09.00.21.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 405.287,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "605 - 640x360"
    },
    {
      "asr": null,
      "filesize": 1951223,
      "format_id": "243",
      "format_note": "360p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 360,
      "quality": 6.0,
      "has_drm": false,
      "tbr": 156.831,
      "filesize_approx": 1951212,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=243&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=1951223&dur=99.532&lmt=1646451069245258&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgGjomINp8UfFz6JDtKIXoL6HrWqf98wxw8EYvZfQjkfoCIC0O3HnCLQ8iw4Gx42rAbomPp8jd-bWrfJOzRdrap0bg&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 640,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "vp09.00.21.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "webm",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 156.831,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "243 - 640x360 (360p)"
    },
    {
      "asr": null,
      "filesize": 1424186,
      "format_id": "396",
      "format_note": "360p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 360,
      "quality": 6.0,
      "has_drm": false,
      "tbr": 114.47,
      "filesize_approx": 1424178,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=396&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=1424186&dur=99.532&lmt=1646450533146394&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAJ0XqT9GdPM1ReCxq9hq9Kx-8EXvFAcb3bBWsbLBX6DHAiEAzSDNsFrRyyHHtCdG85XC3WSmG1Fc1CHUzn9eVdDgLpM%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 640,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "av01.0.01M.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 114.47,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "396 - 640x360 (360p)"
    },
    {
      "format_id": "231",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/231/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/sgovp/clen%3D1840696%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D135%3Blmt%3D1646449968322069/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRAIgKHNZ0kQRaoPAD1BNHigXlXxwizNUW1ItEha17OLhYnsCIG8Kx3hZJIfB6J_0Z4B5-3R9xtw71syg0WRoB8ZyJxaO/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRgIhAO3RWQyc4HL522yV1kVpwtcdcUELUbSiuIe1CEtg-MgYAiEAlNrrtIQgaRvGG0sVIK3gjy0dTeIj_rFhhxP4XLUBccQ%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 399.119,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 7,
      "has_drm": false,
      "width": 854,
      "height": 480,
      "vcodec": "avc1.4D401F",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 399.119,
      "resolution": "854x480",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "231 - 854x480"
    },
    {
      "asr": null,
      "filesize": 1840696,
      "format_id": "135",
      "format_note": "480p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 480,
      "quality": 7.0,
      "has_drm": false,
      "tbr": 147.948,
      "filesize_approx": 1840695,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=135&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=1840696&dur=99.532&lmt=1646449968322069&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgIXKw9j3yqL6Kw12u0xZKXY_hKBulKUZhrW-P-HZCqIoCIQD1L1RJcY-iiC8165Q7mkvrUd4fyryNCGIEF1LtPwHANA%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 854,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "avc1.4D401F",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 147.948,
      "resolution": "854x480",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "135 - 854x480 (480p)"
    },
    {
      "format_id": "606",
      "format_index": null,
      "url": "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404:7ac0:6e9c:5e75:100b:7487:281d:4dbd/id/9187cdbe617406ac/itag/606/source/youtube/requiressl/yes/ratebypass/yes/pfa/1/wft/1/sgovp/clen%3D3313785%3Bdur%3D99.532%3Bgir%3Dyes%3Bitag%3D244%3Blmt%3D1646451075495895/rqh/1/hls_chunk_host/rr1---sn-npoe7ned.googlevideo.com/xpc/EgVo2aDSNQ%3D%3D/met/1744688132,/mh/yi/mm/31,26/mn/sn-npoe7ned,sn-un57enez/ms/au,onr/mv/m/mvi/1/pl/36/rms/au,au/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/playlist_type/DVR/dover/13/txp/4532434/mt/1744687757/fvip/4/short_key/1/keepalive/yes/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,pfa,wft,sgovp,rqh,xpc,pcm2,bui,spc,vprv,playlist_type/sig/AJfQdSswRQIgTdxkIfbr_6v-v6HzcIFuiif7DGexOgIGksO4WGHW6AwCIQCBiw_c_07AED7zJNQwi4R61z2py4wNKF7nMfZWlCglRA%3D%3D/lsparams/hls_chunk_host,met,mh,mm,mn,ms,mv,mvi,pl,rms,initcwndbps/lsig/ACuhMU0wRgIhAPqYSnVP51Im2QyH_aa1f6jkKOA287Qp-Ul9uF46KFUlAiEAg0BXM6KDMQvoBtoPbw4ikPBhkj_MDwyBrYx-L-JenUg%3D/playlist/index.m3u8",
      "manifest_url": "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1744709732/ei/BNT9Z9mOI4_MqfkP3oyu8AI/ip/2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd/id/9187cdbe617406ac/source/youtube/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/playback_host/rr1---sn-npoe7ned.googlevideo.com/met/1744688132%2C/mh/yi/mm/31%2C26/mn/sn-npoe7ned%2Csn-un57enez/ms/au%2Conr/mv/m/mvi/1/pl/36/rms/au%2Cau/tx/51442272/txs/51442271%2C51442272%2C51442273%2C51442274%2C51442275/hfr/1/demuxed/1/tts_caps/1/maudio/1/pcm2/yes/initcwndbps/4865000/bui/AccgBcMNsts0ybDjGyWDI4Y730GT7Bx5faybRLm0yfOFaproF7TClL0ADA-pLDtjn33qfjKCUMnwmhjt/spc/_S3wKkhYghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8mSIl8DM0Em-s/vprv/1/go/1/rqh/5/mt/1744687757/fvip/4/nvgoi/1/short_key/1/ncsapi/1/keepalive/yes/dover/13/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cdemuxed%2Ctts_caps%2Cmaudio%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIgEaTkQmCiHOU-GvFcFWFXg0otoNNxHpD_uSIMx1EKwiICIQCAi0kx75nyBRtokprLFKWy4Ez8r10fNOByqMVM1F8YPg%3D%3D/lsparams/playback_host%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps/lsig/ACuhMU0wRgIhAK7TWxYRHO6pvnEIaO2MTSeV6PPaMfGUpxZuOiiyYBW5AiEAo3TCfT3asLeEoznTX0FsiU54jxZ2n4RRmy97QHyNh08%3D/file/index.m3u8",
      "tbr": 581.772,
      "ext": "mp4",
      "fps": 30.0,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": 7,
      "has_drm": false,
      "width": 854,
      "height": 480,
      "vcodec": "vp09.00.30.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "source_preference": -1,
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 581.772,
      "resolution": "854x480",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "606 - 854x480"
    },
    {
      "asr": null,
      "filesize": 3313785,
      "format_id": "244",
      "format_note": "480p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 480,
      "quality": 7.0,
      "has_drm": false,
      "tbr": 266.349,
      "filesize_approx": 3313781,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=244&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=3313785&dur=99.532&lmt=1646451075495895&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgEJuUk70olVrjw3LcM09zC3QWJAZDdzB9Kr5bLvO2keUCID8uaBtOLm9Dut57Bcln4GtuSP1mAV2gY5qTJU8vYNwh&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 854,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "vp09.00.30.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "webm",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 266.349,
      "resolution": "854x480",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "244 - 854x480 (480p)"
    },
    {
      "asr": null,
      "filesize": 2386588,
      "format_id": "397",
      "format_note": "480p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 480,
      "quality": 7.0,
      "has_drm": false,
      "tbr": 191.824,
      "filesize_approx": 2386578,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=397&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=2386588&dur=99.532&lmt=1646450261737193&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgBgWJ49RgGU-6pv3TjU95bTg5PesM91JbQ7pFI6Ky6MYCID_vBLLs3fWJRbKJDdlsX5jW57bjyMlBIrIFYPV3jANb&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 854,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "av01.0.04M.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 191.824,
      "resolution": "854x480",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "397 - 854x480 (480p)"
    }
  ],
  "thumbnails": [
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/3.jpg",
      "preference": -37,
      "id": "0"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/3.webp",
      "preference": -36,
      "id": "1"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/2.jpg",
      "preference": -35,
      "id": "2"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/2.webp",
      "preference": -34,
      "id": "3"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/1.jpg",
      "preference": -33,
      "id": "4"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/1.webp",
      "preference": -32,
      "id": "5"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/mq3.jpg",
      "preference": -31,
      "id": "6"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/mq3.webp",
      "preference": -30,
      "id": "7"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/mq2.jpg",
      "preference": -29,
      "id": "8"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/mq2.webp",
      "preference": -28,
      "id": "9"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/mq1.jpg",
      "preference": -27,
      "id": "10"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/mq1.webp",
      "preference": -26,
      "id": "11"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hq3.jpg",
      "preference": -25,
      "id": "12"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/hq3.webp",
      "preference": -24,
      "id": "13"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hq2.jpg",
      "preference": -23,
      "id": "14"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/hq2.webp",
      "preference": -22,
      "id": "15"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hq1.jpg",
      "preference": -21,
      "id": "16"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/hq1.webp",
      "preference": -20,
      "id": "17"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/sd3.jpg",
      "preference": -19,
      "id": "18"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/sd3.webp",
      "preference": -18,
      "id": "19"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/sd2.jpg",
      "preference": -17,
      "id": "20"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/sd2.webp",
      "preference": -16,
      "id": "21"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/sd1.jpg",
      "preference": -15,
      "id": "22"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/sd1.webp",
      "preference": -14,
      "id": "23"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/default.jpg",
      "preference": -13,
      "id": "24"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/default.jpg?sqp=-oaymwEkCHgQWvKriqkDGvABAfgB1AaAAtYDigIMCAAQARhlIGUoZTAP&rs=AOn4CLDxgQ4tJxVNrVL5hEhM0dfAN14KZA",
      "height": 90,
      "width": 120,
      "preference": -13,
      "id": "25",
      "resolution": "120x90"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/default.webp",
      "preference": -12,
      "id": "26"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/mqdefault.jpg",
      "preference": -11,
      "id": "27"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/mqdefault.jpg?sqp=-oaymwEmCMACELQB8quKqQMa8AEB-AHUBoAC1gOKAgwIABABGGUgZShlMA8=&rs=AOn4CLC5pwd9jpUVLmitPiMr07bj6ulehw",
      "height": 180,
      "width": 320,
      "preference": -11,
      "id": "28",
      "resolution": "320x180"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/mqdefault.webp",
      "preference": -10,
      "id": "29"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/0.jpg",
      "preference": -9,
      "id": "30"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/0.webp",
      "preference": -8,
      "id": "31"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg",
      "preference": -7,
      "id": "32"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg?sqp=-oaymwE1CKgBEF5IVfKriqkDKAgBFQAAiEIYAXABwAEG8AEB-AHUBoAC1gOKAgwIABABGGUgZShlMA8=&rs=AOn4CLCrASQz4-nZDfsyfE2ZIFcVNnPLUw",
      "height": 94,
      "width": 168,
      "preference": -7,
      "id": "33",
      "resolution": "168x94"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg?sqp=-oaymwE1CMQBEG5IVfKriqkDKAgBFQAAiEIYAXABwAEG8AEB-AHUBoAC1gOKAgwIABABGGUgZShlMA8=&rs=AOn4CLBED71EjLbkAS_1M8iHlVL2iqpsZw",
      "height": 110,
      "width": 196,
      "preference": -7,
      "id": "34",
      "resolution": "196x110"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg?sqp=-oaymwE2CPYBEIoBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB1AaAAtYDigIMCAAQARhlIGUoZTAP&rs=AOn4CLCq99F1TuB1FoiyOlwa7FQQ7VtE3A",
      "height": 138,
      "width": 246,
      "preference": -7,
      "id": "35",
      "resolution": "246x138"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB1AaAAtYDigIMCAAQARhlIGUoZTAP&rs=AOn4CLCwD73Pf1litTyoyh_1KUP3mKL8_A",
      "height": 188,
      "width": 336,
      "preference": -7,
      "id": "36",
      "resolution": "336x188"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AHUBoAC1gOKAgwIABABGGUgZShlMA8=&rs=AOn4CLChgpT6OKCKcn_trVFbNa_DD3MUYw",
      "height": 360,
      "width": 480,
      "preference": -7,
      "id": "37",
      "resolution": "480x360"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/hqdefault.webp",
      "preference": -6,
      "id": "38"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/sddefault.jpg",
      "preference": -5,
      "id": "39"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/sddefault.webp",
      "preference": -4,
      "id": "40"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hq720.jpg",
      "preference": -3,
      "id": "41"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/hq720.webp",
      "preference": -2,
      "id": "42"
    },
    {
      "url": "https://i.ytimg.com/vi/kYfNvmF0Bqw/maxresdefault.jpg",
      "preference": -1,
      "id": "43"
    },
    {
      "url": "https://i.ytimg.com/vi_webp/kYfNvmF0Bqw/maxresdefault.webp",
      "preference": 0,
      "id": "44"
    }
  ],
  "thumbnail": "https://i.ytimg.com/vi/kYfNvmF0Bqw/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AHUBoAC1gOKAgwIABABGGUgZShlMA8=&rs=AOn4CLChgpT6OKCKcn_trVFbNa_DD3MUYw",
  "description": "In 1994, the Santa Clara Valley Historical Association interviewed Steve Jobs. What he said during this unscripted film interview is remarkable. In this footage, Steve talks about his values, advice to entrepreneurs and his thoughts on how to best live life. This is a segment from the full unscripted interview.\n\nSteve Jobs 1994 Interview\nInterview date: November 11, 1994\nInterviewer: John McLaughlin, Historian and President of the Santa Clara Valley Historical Association\n\nInterviewer's question: \n\"If this was going to be viewed forever by young high school kids and college kids — young entrepreneurs who want to go out and do something while they're still young. You know, the advantages of doing that. It opened up a whole new gate for other young entrepreneurs. What advice would you give them?\" \n\nTranscript:\n\". . . The thing I would say is, when you grow up, you tend to get told that the world is the way it is, and your life is just to live your life inside the world. Try not to bash into the walls too much. Try to have a nice family life, have fun, save a little money. But life, that's a very limited life. Life can be much broader once you discover one simple fact, and that is: Everything around you that you call life was made up by people that were no smarter than you. And you can change it. You can influence it. You can build your own things that other people can use. And the minute that you understand that you can poke life, and actually something will, you know, if you push in, something will pop out the other side, that you can change it. You can mold it. That's maybe the most important thing is to shake off this erroneous notion that life is there and you're just going to live in it, versus embrace it. Change it. Improve it. Make your mark upon it. I think that's very important. And however you learn that, once you learn it, you'll want to change life and make it better. Because it's kind of messed up in a lot of ways. Once you learn that, you'll never be the same again.\"\n\nFor requests to use this copyright-protected work in any manner, email the copyright owner, Santa Clara Valley Historical Association. The contact information can be found on our YouTube About page.",
  "channel_id": "UCMIUCjJ3Ca84cf3iA1P9UhQ",
  "channel_url": "https://www.youtube.com/channel/UCMIUCjJ3Ca84cf3iA1P9UhQ",
  "duration": 100,
  "view_count": 5784174,
  "average_rating": null,
  "age_limit": 0,
  "webpage_url": "https://www.youtube.com/watch?v=kYfNvmF0Bqw",
  "categories": [
    "Education"
  ],
  "tags": [
    "Steve Jobs",
    "interview",
    "live your life",
    "Steve Jobs interview",
    "Steve Jobs thoughts",
    "Steve Jobs on life",
    "guru",
    "Steve Jobs guru",
    "Steve Jobs rare interview",
    "rare interview",
    "interview steve jobs",
    "secrets of life",
    "steve jobs secrets of life",
    "unscripted interview",
    "unscripted"
  ],
  "playable_in_embed": true,
  "live_status": "not_live",
  "release_timestamp": null,
  "_format_sort_fields": [
    "quality",
    "res",
    "fps",
    "hdr:12",
    "source",
    "vcodec",
    "channels",
    "acodec",
    "lang",
    "proto"
  ],
  "automatic_captions": {
    "ab": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ab&fmt=json3",
        "name": "Abkhazian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ab&fmt=srv1",
        "name": "Abkhazian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ab&fmt=srv2",
        "name": "Abkhazian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ab&fmt=srv3",
        "name": "Abkhazian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ab&fmt=ttml",
        "name": "Abkhazian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ab&fmt=vtt",
        "name": "Abkhazian"
      }
    ],
    "aa": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=aa&fmt=json3",
        "name": "Afar"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=aa&fmt=srv1",
        "name": "Afar"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=aa&fmt=srv2",
        "name": "Afar"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=aa&fmt=srv3",
        "name": "Afar"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=aa&fmt=ttml",
        "name": "Afar"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=aa&fmt=vtt",
        "name": "Afar"
      }
    ],
    "af": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=af&fmt=json3",
        "name": "Afrikaans"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=af&fmt=srv1",
        "name": "Afrikaans"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=af&fmt=srv2",
        "name": "Afrikaans"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=af&fmt=srv3",
        "name": "Afrikaans"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=af&fmt=ttml",
        "name": "Afrikaans"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=af&fmt=vtt",
        "name": "Afrikaans"
      }
    ],
    "ak": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ak&fmt=json3",
        "name": "Akan"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ak&fmt=srv1",
        "name": "Akan"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ak&fmt=srv2",
        "name": "Akan"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ak&fmt=srv3",
        "name": "Akan"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ak&fmt=ttml",
        "name": "Akan"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ak&fmt=vtt",
        "name": "Akan"
      }
    ],
    "sq": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sq&fmt=json3",
        "name": "Albanian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sq&fmt=srv1",
        "name": "Albanian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sq&fmt=srv2",
        "name": "Albanian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sq&fmt=srv3",
        "name": "Albanian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sq&fmt=ttml",
        "name": "Albanian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sq&fmt=vtt",
        "name": "Albanian"
      }
    ],
    "am": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=am&fmt=json3",
        "name": "Amharic"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=am&fmt=srv1",
        "name": "Amharic"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=am&fmt=srv2",
        "name": "Amharic"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=am&fmt=srv3",
        "name": "Amharic"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=am&fmt=ttml",
        "name": "Amharic"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=am&fmt=vtt",
        "name": "Amharic"
      }
    ],
    "ar": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ar&fmt=json3",
        "name": "Arabic"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ar&fmt=srv1",
        "name": "Arabic"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ar&fmt=srv2",
        "name": "Arabic"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ar&fmt=srv3",
        "name": "Arabic"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ar&fmt=ttml",
        "name": "Arabic"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ar&fmt=vtt",
        "name": "Arabic"
      }
    ],
    "hy": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hy&fmt=json3",
        "name": "Armenian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hy&fmt=srv1",
        "name": "Armenian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hy&fmt=srv2",
        "name": "Armenian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hy&fmt=srv3",
        "name": "Armenian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hy&fmt=ttml",
        "name": "Armenian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hy&fmt=vtt",
        "name": "Armenian"
      }
    ],
    "as": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=as&fmt=json3",
        "name": "Assamese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=as&fmt=srv1",
        "name": "Assamese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=as&fmt=srv2",
        "name": "Assamese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=as&fmt=srv3",
        "name": "Assamese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=as&fmt=ttml",
        "name": "Assamese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=as&fmt=vtt",
        "name": "Assamese"
      }
    ],
    "ay": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ay&fmt=json3",
        "name": "Aymara"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ay&fmt=srv1",
        "name": "Aymara"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ay&fmt=srv2",
        "name": "Aymara"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ay&fmt=srv3",
        "name": "Aymara"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ay&fmt=ttml",
        "name": "Aymara"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ay&fmt=vtt",
        "name": "Aymara"
      }
    ],
    "az": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=az&fmt=json3",
        "name": "Azerbaijani"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=az&fmt=srv1",
        "name": "Azerbaijani"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=az&fmt=srv2",
        "name": "Azerbaijani"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=az&fmt=srv3",
        "name": "Azerbaijani"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=az&fmt=ttml",
        "name": "Azerbaijani"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=az&fmt=vtt",
        "name": "Azerbaijani"
      }
    ],
    "bn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bn&fmt=json3",
        "name": "Bangla"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bn&fmt=srv1",
        "name": "Bangla"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bn&fmt=srv2",
        "name": "Bangla"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bn&fmt=srv3",
        "name": "Bangla"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bn&fmt=ttml",
        "name": "Bangla"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bn&fmt=vtt",
        "name": "Bangla"
      }
    ],
    "ba": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ba&fmt=json3",
        "name": "Bashkir"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ba&fmt=srv1",
        "name": "Bashkir"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ba&fmt=srv2",
        "name": "Bashkir"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ba&fmt=srv3",
        "name": "Bashkir"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ba&fmt=ttml",
        "name": "Bashkir"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ba&fmt=vtt",
        "name": "Bashkir"
      }
    ],
    "eu": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eu&fmt=json3",
        "name": "Basque"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eu&fmt=srv1",
        "name": "Basque"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eu&fmt=srv2",
        "name": "Basque"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eu&fmt=srv3",
        "name": "Basque"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eu&fmt=ttml",
        "name": "Basque"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eu&fmt=vtt",
        "name": "Basque"
      }
    ],
    "be": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=be&fmt=json3",
        "name": "Belarusian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=be&fmt=srv1",
        "name": "Belarusian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=be&fmt=srv2",
        "name": "Belarusian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=be&fmt=srv3",
        "name": "Belarusian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=be&fmt=ttml",
        "name": "Belarusian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=be&fmt=vtt",
        "name": "Belarusian"
      }
    ],
    "bho": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bho&fmt=json3",
        "name": "Bhojpuri"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bho&fmt=srv1",
        "name": "Bhojpuri"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bho&fmt=srv2",
        "name": "Bhojpuri"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bho&fmt=srv3",
        "name": "Bhojpuri"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bho&fmt=ttml",
        "name": "Bhojpuri"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bho&fmt=vtt",
        "name": "Bhojpuri"
      }
    ],
    "bs": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bs&fmt=json3",
        "name": "Bosnian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bs&fmt=srv1",
        "name": "Bosnian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bs&fmt=srv2",
        "name": "Bosnian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bs&fmt=srv3",
        "name": "Bosnian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bs&fmt=ttml",
        "name": "Bosnian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bs&fmt=vtt",
        "name": "Bosnian"
      }
    ],
    "br": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=br&fmt=json3",
        "name": "Breton"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=br&fmt=srv1",
        "name": "Breton"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=br&fmt=srv2",
        "name": "Breton"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=br&fmt=srv3",
        "name": "Breton"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=br&fmt=ttml",
        "name": "Breton"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=br&fmt=vtt",
        "name": "Breton"
      }
    ],
    "bg": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bg&fmt=json3",
        "name": "Bulgarian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bg&fmt=srv1",
        "name": "Bulgarian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bg&fmt=srv2",
        "name": "Bulgarian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bg&fmt=srv3",
        "name": "Bulgarian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bg&fmt=ttml",
        "name": "Bulgarian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bg&fmt=vtt",
        "name": "Bulgarian"
      }
    ],
    "my": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=my&fmt=json3",
        "name": "Burmese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=my&fmt=srv1",
        "name": "Burmese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=my&fmt=srv2",
        "name": "Burmese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=my&fmt=srv3",
        "name": "Burmese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=my&fmt=ttml",
        "name": "Burmese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=my&fmt=vtt",
        "name": "Burmese"
      }
    ],
    "ca": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ca&fmt=json3",
        "name": "Catalan"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ca&fmt=srv1",
        "name": "Catalan"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ca&fmt=srv2",
        "name": "Catalan"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ca&fmt=srv3",
        "name": "Catalan"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ca&fmt=ttml",
        "name": "Catalan"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ca&fmt=vtt",
        "name": "Catalan"
      }
    ],
    "ceb": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ceb&fmt=json3",
        "name": "Cebuano"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ceb&fmt=srv1",
        "name": "Cebuano"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ceb&fmt=srv2",
        "name": "Cebuano"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ceb&fmt=srv3",
        "name": "Cebuano"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ceb&fmt=ttml",
        "name": "Cebuano"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ceb&fmt=vtt",
        "name": "Cebuano"
      }
    ],
    "zh-Hans": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hans&fmt=json3",
        "name": "Chinese (Simplified)"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hans&fmt=srv1",
        "name": "Chinese (Simplified)"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hans&fmt=srv2",
        "name": "Chinese (Simplified)"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hans&fmt=srv3",
        "name": "Chinese (Simplified)"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hans&fmt=ttml",
        "name": "Chinese (Simplified)"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hans&fmt=vtt",
        "name": "Chinese (Simplified)"
      }
    ],
    "zh-Hant": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hant&fmt=json3",
        "name": "Chinese (Traditional)"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hant&fmt=srv1",
        "name": "Chinese (Traditional)"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hant&fmt=srv2",
        "name": "Chinese (Traditional)"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hant&fmt=srv3",
        "name": "Chinese (Traditional)"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hant&fmt=ttml",
        "name": "Chinese (Traditional)"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zh-Hant&fmt=vtt",
        "name": "Chinese (Traditional)"
      }
    ],
    "co": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=co&fmt=json3",
        "name": "Corsican"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=co&fmt=srv1",
        "name": "Corsican"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=co&fmt=srv2",
        "name": "Corsican"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=co&fmt=srv3",
        "name": "Corsican"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=co&fmt=ttml",
        "name": "Corsican"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=co&fmt=vtt",
        "name": "Corsican"
      }
    ],
    "hr": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hr&fmt=json3",
        "name": "Croatian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hr&fmt=srv1",
        "name": "Croatian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hr&fmt=srv2",
        "name": "Croatian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hr&fmt=srv3",
        "name": "Croatian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hr&fmt=ttml",
        "name": "Croatian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hr&fmt=vtt",
        "name": "Croatian"
      }
    ],
    "cs": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cs&fmt=json3",
        "name": "Czech"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cs&fmt=srv1",
        "name": "Czech"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cs&fmt=srv2",
        "name": "Czech"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cs&fmt=srv3",
        "name": "Czech"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cs&fmt=ttml",
        "name": "Czech"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cs&fmt=vtt",
        "name": "Czech"
      }
    ],
    "da": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=da&fmt=json3",
        "name": "Danish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=da&fmt=srv1",
        "name": "Danish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=da&fmt=srv2",
        "name": "Danish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=da&fmt=srv3",
        "name": "Danish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=da&fmt=ttml",
        "name": "Danish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=da&fmt=vtt",
        "name": "Danish"
      }
    ],
    "dv": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dv&fmt=json3",
        "name": "Divehi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dv&fmt=srv1",
        "name": "Divehi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dv&fmt=srv2",
        "name": "Divehi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dv&fmt=srv3",
        "name": "Divehi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dv&fmt=ttml",
        "name": "Divehi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dv&fmt=vtt",
        "name": "Divehi"
      }
    ],
    "nl": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nl&fmt=json3",
        "name": "Dutch"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nl&fmt=srv1",
        "name": "Dutch"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nl&fmt=srv2",
        "name": "Dutch"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nl&fmt=srv3",
        "name": "Dutch"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nl&fmt=ttml",
        "name": "Dutch"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nl&fmt=vtt",
        "name": "Dutch"
      }
    ],
    "dz": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dz&fmt=json3",
        "name": "Dzongkha"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dz&fmt=srv1",
        "name": "Dzongkha"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dz&fmt=srv2",
        "name": "Dzongkha"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dz&fmt=srv3",
        "name": "Dzongkha"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dz&fmt=ttml",
        "name": "Dzongkha"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=dz&fmt=vtt",
        "name": "Dzongkha"
      }
    ],
    "en-orig": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=json3",
        "name": "English (Original)"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=srv1",
        "name": "English (Original)"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=srv2",
        "name": "English (Original)"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=srv3",
        "name": "English (Original)"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=ttml",
        "name": "English (Original)"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=vtt",
        "name": "English (Original)"
      }
    ],
    "en": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=json3",
        "name": "English"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=srv1",
        "name": "English"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=srv2",
        "name": "English"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=srv3",
        "name": "English"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=ttml",
        "name": "English"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&fmt=vtt",
        "name": "English"
      }
    ],
    "eo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eo&fmt=json3",
        "name": "Esperanto"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eo&fmt=srv1",
        "name": "Esperanto"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eo&fmt=srv2",
        "name": "Esperanto"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eo&fmt=srv3",
        "name": "Esperanto"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eo&fmt=ttml",
        "name": "Esperanto"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=eo&fmt=vtt",
        "name": "Esperanto"
      }
    ],
    "et": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=et&fmt=json3",
        "name": "Estonian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=et&fmt=srv1",
        "name": "Estonian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=et&fmt=srv2",
        "name": "Estonian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=et&fmt=srv3",
        "name": "Estonian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=et&fmt=ttml",
        "name": "Estonian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=et&fmt=vtt",
        "name": "Estonian"
      }
    ],
    "ee": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ee&fmt=json3",
        "name": "Ewe"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ee&fmt=srv1",
        "name": "Ewe"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ee&fmt=srv2",
        "name": "Ewe"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ee&fmt=srv3",
        "name": "Ewe"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ee&fmt=ttml",
        "name": "Ewe"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ee&fmt=vtt",
        "name": "Ewe"
      }
    ],
    "fo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fo&fmt=json3",
        "name": "Faroese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fo&fmt=srv1",
        "name": "Faroese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fo&fmt=srv2",
        "name": "Faroese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fo&fmt=srv3",
        "name": "Faroese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fo&fmt=ttml",
        "name": "Faroese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fo&fmt=vtt",
        "name": "Faroese"
      }
    ],
    "fj": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fj&fmt=json3",
        "name": "Fijian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fj&fmt=srv1",
        "name": "Fijian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fj&fmt=srv2",
        "name": "Fijian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fj&fmt=srv3",
        "name": "Fijian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fj&fmt=ttml",
        "name": "Fijian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fj&fmt=vtt",
        "name": "Fijian"
      }
    ],
    "fil": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fil&fmt=json3",
        "name": "Filipino"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fil&fmt=srv1",
        "name": "Filipino"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fil&fmt=srv2",
        "name": "Filipino"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fil&fmt=srv3",
        "name": "Filipino"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fil&fmt=ttml",
        "name": "Filipino"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fil&fmt=vtt",
        "name": "Filipino"
      }
    ],
    "fi": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fi&fmt=json3",
        "name": "Finnish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fi&fmt=srv1",
        "name": "Finnish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fi&fmt=srv2",
        "name": "Finnish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fi&fmt=srv3",
        "name": "Finnish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fi&fmt=ttml",
        "name": "Finnish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fi&fmt=vtt",
        "name": "Finnish"
      }
    ],
    "fr": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fr&fmt=json3",
        "name": "French"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fr&fmt=srv1",
        "name": "French"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fr&fmt=srv2",
        "name": "French"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fr&fmt=srv3",
        "name": "French"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fr&fmt=ttml",
        "name": "French"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fr&fmt=vtt",
        "name": "French"
      }
    ],
    "gaa": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gaa&fmt=json3",
        "name": "Ga"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gaa&fmt=srv1",
        "name": "Ga"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gaa&fmt=srv2",
        "name": "Ga"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gaa&fmt=srv3",
        "name": "Ga"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gaa&fmt=ttml",
        "name": "Ga"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gaa&fmt=vtt",
        "name": "Ga"
      }
    ],
    "gl": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gl&fmt=json3",
        "name": "Galician"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gl&fmt=srv1",
        "name": "Galician"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gl&fmt=srv2",
        "name": "Galician"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gl&fmt=srv3",
        "name": "Galician"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gl&fmt=ttml",
        "name": "Galician"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gl&fmt=vtt",
        "name": "Galician"
      }
    ],
    "lg": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lg&fmt=json3",
        "name": "Ganda"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lg&fmt=srv1",
        "name": "Ganda"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lg&fmt=srv2",
        "name": "Ganda"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lg&fmt=srv3",
        "name": "Ganda"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lg&fmt=ttml",
        "name": "Ganda"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lg&fmt=vtt",
        "name": "Ganda"
      }
    ],
    "ka": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ka&fmt=json3",
        "name": "Georgian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ka&fmt=srv1",
        "name": "Georgian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ka&fmt=srv2",
        "name": "Georgian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ka&fmt=srv3",
        "name": "Georgian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ka&fmt=ttml",
        "name": "Georgian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ka&fmt=vtt",
        "name": "Georgian"
      }
    ],
    "de": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=de&fmt=json3",
        "name": "German"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=de&fmt=srv1",
        "name": "German"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=de&fmt=srv2",
        "name": "German"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=de&fmt=srv3",
        "name": "German"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=de&fmt=ttml",
        "name": "German"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=de&fmt=vtt",
        "name": "German"
      }
    ],
    "el": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=el&fmt=json3",
        "name": "Greek"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=el&fmt=srv1",
        "name": "Greek"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=el&fmt=srv2",
        "name": "Greek"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=el&fmt=srv3",
        "name": "Greek"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=el&fmt=ttml",
        "name": "Greek"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=el&fmt=vtt",
        "name": "Greek"
      }
    ],
    "gn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gn&fmt=json3",
        "name": "Guarani"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gn&fmt=srv1",
        "name": "Guarani"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gn&fmt=srv2",
        "name": "Guarani"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gn&fmt=srv3",
        "name": "Guarani"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gn&fmt=ttml",
        "name": "Guarani"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gn&fmt=vtt",
        "name": "Guarani"
      }
    ],
    "gu": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gu&fmt=json3",
        "name": "Gujarati"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gu&fmt=srv1",
        "name": "Gujarati"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gu&fmt=srv2",
        "name": "Gujarati"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gu&fmt=srv3",
        "name": "Gujarati"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gu&fmt=ttml",
        "name": "Gujarati"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gu&fmt=vtt",
        "name": "Gujarati"
      }
    ],
    "ht": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ht&fmt=json3",
        "name": "Haitian Creole"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ht&fmt=srv1",
        "name": "Haitian Creole"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ht&fmt=srv2",
        "name": "Haitian Creole"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ht&fmt=srv3",
        "name": "Haitian Creole"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ht&fmt=ttml",
        "name": "Haitian Creole"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ht&fmt=vtt",
        "name": "Haitian Creole"
      }
    ],
    "ha": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ha&fmt=json3",
        "name": "Hausa"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ha&fmt=srv1",
        "name": "Hausa"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ha&fmt=srv2",
        "name": "Hausa"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ha&fmt=srv3",
        "name": "Hausa"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ha&fmt=ttml",
        "name": "Hausa"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ha&fmt=vtt",
        "name": "Hausa"
      }
    ],
    "haw": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=haw&fmt=json3",
        "name": "Hawaiian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=haw&fmt=srv1",
        "name": "Hawaiian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=haw&fmt=srv2",
        "name": "Hawaiian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=haw&fmt=srv3",
        "name": "Hawaiian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=haw&fmt=ttml",
        "name": "Hawaiian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=haw&fmt=vtt",
        "name": "Hawaiian"
      }
    ],
    "iw": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iw&fmt=json3",
        "name": "Hebrew"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iw&fmt=srv1",
        "name": "Hebrew"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iw&fmt=srv2",
        "name": "Hebrew"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iw&fmt=srv3",
        "name": "Hebrew"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iw&fmt=ttml",
        "name": "Hebrew"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iw&fmt=vtt",
        "name": "Hebrew"
      }
    ],
    "hi": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hi&fmt=json3",
        "name": "Hindi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hi&fmt=srv1",
        "name": "Hindi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hi&fmt=srv2",
        "name": "Hindi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hi&fmt=srv3",
        "name": "Hindi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hi&fmt=ttml",
        "name": "Hindi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hi&fmt=vtt",
        "name": "Hindi"
      }
    ],
    "hmn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hmn&fmt=json3",
        "name": "Hmong"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hmn&fmt=srv1",
        "name": "Hmong"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hmn&fmt=srv2",
        "name": "Hmong"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hmn&fmt=srv3",
        "name": "Hmong"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hmn&fmt=ttml",
        "name": "Hmong"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hmn&fmt=vtt",
        "name": "Hmong"
      }
    ],
    "hu": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hu&fmt=json3",
        "name": "Hungarian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hu&fmt=srv1",
        "name": "Hungarian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hu&fmt=srv2",
        "name": "Hungarian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hu&fmt=srv3",
        "name": "Hungarian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hu&fmt=ttml",
        "name": "Hungarian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=hu&fmt=vtt",
        "name": "Hungarian"
      }
    ],
    "is": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=is&fmt=json3",
        "name": "Icelandic"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=is&fmt=srv1",
        "name": "Icelandic"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=is&fmt=srv2",
        "name": "Icelandic"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=is&fmt=srv3",
        "name": "Icelandic"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=is&fmt=ttml",
        "name": "Icelandic"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=is&fmt=vtt",
        "name": "Icelandic"
      }
    ],
    "ig": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ig&fmt=json3",
        "name": "Igbo"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ig&fmt=srv1",
        "name": "Igbo"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ig&fmt=srv2",
        "name": "Igbo"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ig&fmt=srv3",
        "name": "Igbo"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ig&fmt=ttml",
        "name": "Igbo"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ig&fmt=vtt",
        "name": "Igbo"
      }
    ],
    "id": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=id&fmt=json3",
        "name": "Indonesian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=id&fmt=srv1",
        "name": "Indonesian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=id&fmt=srv2",
        "name": "Indonesian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=id&fmt=srv3",
        "name": "Indonesian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=id&fmt=ttml",
        "name": "Indonesian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=id&fmt=vtt",
        "name": "Indonesian"
      }
    ],
    "iu": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iu&fmt=json3",
        "name": "Inuktitut"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iu&fmt=srv1",
        "name": "Inuktitut"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iu&fmt=srv2",
        "name": "Inuktitut"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iu&fmt=srv3",
        "name": "Inuktitut"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iu&fmt=ttml",
        "name": "Inuktitut"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=iu&fmt=vtt",
        "name": "Inuktitut"
      }
    ],
    "ga": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ga&fmt=json3",
        "name": "Irish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ga&fmt=srv1",
        "name": "Irish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ga&fmt=srv2",
        "name": "Irish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ga&fmt=srv3",
        "name": "Irish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ga&fmt=ttml",
        "name": "Irish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ga&fmt=vtt",
        "name": "Irish"
      }
    ],
    "it": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=it&fmt=json3",
        "name": "Italian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=it&fmt=srv1",
        "name": "Italian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=it&fmt=srv2",
        "name": "Italian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=it&fmt=srv3",
        "name": "Italian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=it&fmt=ttml",
        "name": "Italian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=it&fmt=vtt",
        "name": "Italian"
      }
    ],
    "ja": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ja&fmt=json3",
        "name": "Japanese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ja&fmt=srv1",
        "name": "Japanese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ja&fmt=srv2",
        "name": "Japanese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ja&fmt=srv3",
        "name": "Japanese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ja&fmt=ttml",
        "name": "Japanese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ja&fmt=vtt",
        "name": "Japanese"
      }
    ],
    "jv": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=jv&fmt=json3",
        "name": "Javanese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=jv&fmt=srv1",
        "name": "Javanese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=jv&fmt=srv2",
        "name": "Javanese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=jv&fmt=srv3",
        "name": "Javanese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=jv&fmt=ttml",
        "name": "Javanese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=jv&fmt=vtt",
        "name": "Javanese"
      }
    ],
    "kl": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kl&fmt=json3",
        "name": "Kalaallisut"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kl&fmt=srv1",
        "name": "Kalaallisut"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kl&fmt=srv2",
        "name": "Kalaallisut"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kl&fmt=srv3",
        "name": "Kalaallisut"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kl&fmt=ttml",
        "name": "Kalaallisut"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kl&fmt=vtt",
        "name": "Kalaallisut"
      }
    ],
    "kn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kn&fmt=json3",
        "name": "Kannada"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kn&fmt=srv1",
        "name": "Kannada"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kn&fmt=srv2",
        "name": "Kannada"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kn&fmt=srv3",
        "name": "Kannada"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kn&fmt=ttml",
        "name": "Kannada"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kn&fmt=vtt",
        "name": "Kannada"
      }
    ],
    "kk": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kk&fmt=json3",
        "name": "Kazakh"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kk&fmt=srv1",
        "name": "Kazakh"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kk&fmt=srv2",
        "name": "Kazakh"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kk&fmt=srv3",
        "name": "Kazakh"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kk&fmt=ttml",
        "name": "Kazakh"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kk&fmt=vtt",
        "name": "Kazakh"
      }
    ],
    "kha": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kha&fmt=json3",
        "name": "Khasi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kha&fmt=srv1",
        "name": "Khasi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kha&fmt=srv2",
        "name": "Khasi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kha&fmt=srv3",
        "name": "Khasi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kha&fmt=ttml",
        "name": "Khasi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kha&fmt=vtt",
        "name": "Khasi"
      }
    ],
    "km": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=km&fmt=json3",
        "name": "Khmer"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=km&fmt=srv1",
        "name": "Khmer"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=km&fmt=srv2",
        "name": "Khmer"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=km&fmt=srv3",
        "name": "Khmer"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=km&fmt=ttml",
        "name": "Khmer"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=km&fmt=vtt",
        "name": "Khmer"
      }
    ],
    "rw": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rw&fmt=json3",
        "name": "Kinyarwanda"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rw&fmt=srv1",
        "name": "Kinyarwanda"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rw&fmt=srv2",
        "name": "Kinyarwanda"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rw&fmt=srv3",
        "name": "Kinyarwanda"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rw&fmt=ttml",
        "name": "Kinyarwanda"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rw&fmt=vtt",
        "name": "Kinyarwanda"
      }
    ],
    "ko": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ko&fmt=json3",
        "name": "Korean"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ko&fmt=srv1",
        "name": "Korean"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ko&fmt=srv2",
        "name": "Korean"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ko&fmt=srv3",
        "name": "Korean"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ko&fmt=ttml",
        "name": "Korean"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ko&fmt=vtt",
        "name": "Korean"
      }
    ],
    "kri": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kri&fmt=json3",
        "name": "Krio"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kri&fmt=srv1",
        "name": "Krio"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kri&fmt=srv2",
        "name": "Krio"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kri&fmt=srv3",
        "name": "Krio"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kri&fmt=ttml",
        "name": "Krio"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=kri&fmt=vtt",
        "name": "Krio"
      }
    ],
    "ku": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ku&fmt=json3",
        "name": "Kurdish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ku&fmt=srv1",
        "name": "Kurdish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ku&fmt=srv2",
        "name": "Kurdish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ku&fmt=srv3",
        "name": "Kurdish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ku&fmt=ttml",
        "name": "Kurdish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ku&fmt=vtt",
        "name": "Kurdish"
      }
    ],
    "ky": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ky&fmt=json3",
        "name": "Kyrgyz"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ky&fmt=srv1",
        "name": "Kyrgyz"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ky&fmt=srv2",
        "name": "Kyrgyz"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ky&fmt=srv3",
        "name": "Kyrgyz"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ky&fmt=ttml",
        "name": "Kyrgyz"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ky&fmt=vtt",
        "name": "Kyrgyz"
      }
    ],
    "lo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lo&fmt=json3",
        "name": "Lao"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lo&fmt=srv1",
        "name": "Lao"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lo&fmt=srv2",
        "name": "Lao"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lo&fmt=srv3",
        "name": "Lao"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lo&fmt=ttml",
        "name": "Lao"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lo&fmt=vtt",
        "name": "Lao"
      }
    ],
    "la": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=la&fmt=json3",
        "name": "Latin"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=la&fmt=srv1",
        "name": "Latin"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=la&fmt=srv2",
        "name": "Latin"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=la&fmt=srv3",
        "name": "Latin"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=la&fmt=ttml",
        "name": "Latin"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=la&fmt=vtt",
        "name": "Latin"
      }
    ],
    "lv": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lv&fmt=json3",
        "name": "Latvian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lv&fmt=srv1",
        "name": "Latvian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lv&fmt=srv2",
        "name": "Latvian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lv&fmt=srv3",
        "name": "Latvian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lv&fmt=ttml",
        "name": "Latvian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lv&fmt=vtt",
        "name": "Latvian"
      }
    ],
    "ln": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ln&fmt=json3",
        "name": "Lingala"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ln&fmt=srv1",
        "name": "Lingala"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ln&fmt=srv2",
        "name": "Lingala"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ln&fmt=srv3",
        "name": "Lingala"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ln&fmt=ttml",
        "name": "Lingala"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ln&fmt=vtt",
        "name": "Lingala"
      }
    ],
    "lt": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lt&fmt=json3",
        "name": "Lithuanian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lt&fmt=srv1",
        "name": "Lithuanian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lt&fmt=srv2",
        "name": "Lithuanian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lt&fmt=srv3",
        "name": "Lithuanian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lt&fmt=ttml",
        "name": "Lithuanian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lt&fmt=vtt",
        "name": "Lithuanian"
      }
    ],
    "lua": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lua&fmt=json3",
        "name": "Luba-Lulua"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lua&fmt=srv1",
        "name": "Luba-Lulua"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lua&fmt=srv2",
        "name": "Luba-Lulua"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lua&fmt=srv3",
        "name": "Luba-Lulua"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lua&fmt=ttml",
        "name": "Luba-Lulua"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lua&fmt=vtt",
        "name": "Luba-Lulua"
      }
    ],
    "luo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=luo&fmt=json3",
        "name": "Luo"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=luo&fmt=srv1",
        "name": "Luo"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=luo&fmt=srv2",
        "name": "Luo"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=luo&fmt=srv3",
        "name": "Luo"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=luo&fmt=ttml",
        "name": "Luo"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=luo&fmt=vtt",
        "name": "Luo"
      }
    ],
    "lb": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lb&fmt=json3",
        "name": "Luxembourgish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lb&fmt=srv1",
        "name": "Luxembourgish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lb&fmt=srv2",
        "name": "Luxembourgish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lb&fmt=srv3",
        "name": "Luxembourgish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lb&fmt=ttml",
        "name": "Luxembourgish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=lb&fmt=vtt",
        "name": "Luxembourgish"
      }
    ],
    "mk": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mk&fmt=json3",
        "name": "Macedonian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mk&fmt=srv1",
        "name": "Macedonian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mk&fmt=srv2",
        "name": "Macedonian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mk&fmt=srv3",
        "name": "Macedonian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mk&fmt=ttml",
        "name": "Macedonian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mk&fmt=vtt",
        "name": "Macedonian"
      }
    ],
    "mg": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mg&fmt=json3",
        "name": "Malagasy"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mg&fmt=srv1",
        "name": "Malagasy"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mg&fmt=srv2",
        "name": "Malagasy"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mg&fmt=srv3",
        "name": "Malagasy"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mg&fmt=ttml",
        "name": "Malagasy"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mg&fmt=vtt",
        "name": "Malagasy"
      }
    ],
    "ms": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ms&fmt=json3",
        "name": "Malay"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ms&fmt=srv1",
        "name": "Malay"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ms&fmt=srv2",
        "name": "Malay"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ms&fmt=srv3",
        "name": "Malay"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ms&fmt=ttml",
        "name": "Malay"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ms&fmt=vtt",
        "name": "Malay"
      }
    ],
    "ml": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ml&fmt=json3",
        "name": "Malayalam"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ml&fmt=srv1",
        "name": "Malayalam"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ml&fmt=srv2",
        "name": "Malayalam"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ml&fmt=srv3",
        "name": "Malayalam"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ml&fmt=ttml",
        "name": "Malayalam"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ml&fmt=vtt",
        "name": "Malayalam"
      }
    ],
    "mt": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mt&fmt=json3",
        "name": "Maltese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mt&fmt=srv1",
        "name": "Maltese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mt&fmt=srv2",
        "name": "Maltese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mt&fmt=srv3",
        "name": "Maltese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mt&fmt=ttml",
        "name": "Maltese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mt&fmt=vtt",
        "name": "Maltese"
      }
    ],
    "gv": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gv&fmt=json3",
        "name": "Manx"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gv&fmt=srv1",
        "name": "Manx"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gv&fmt=srv2",
        "name": "Manx"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gv&fmt=srv3",
        "name": "Manx"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gv&fmt=ttml",
        "name": "Manx"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gv&fmt=vtt",
        "name": "Manx"
      }
    ],
    "mi": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mi&fmt=json3",
        "name": "Māori"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mi&fmt=srv1",
        "name": "Māori"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mi&fmt=srv2",
        "name": "Māori"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mi&fmt=srv3",
        "name": "Māori"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mi&fmt=ttml",
        "name": "Māori"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mi&fmt=vtt",
        "name": "Māori"
      }
    ],
    "mr": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mr&fmt=json3",
        "name": "Marathi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mr&fmt=srv1",
        "name": "Marathi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mr&fmt=srv2",
        "name": "Marathi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mr&fmt=srv3",
        "name": "Marathi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mr&fmt=ttml",
        "name": "Marathi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mr&fmt=vtt",
        "name": "Marathi"
      }
    ],
    "mn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mn&fmt=json3",
        "name": "Mongolian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mn&fmt=srv1",
        "name": "Mongolian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mn&fmt=srv2",
        "name": "Mongolian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mn&fmt=srv3",
        "name": "Mongolian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mn&fmt=ttml",
        "name": "Mongolian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mn&fmt=vtt",
        "name": "Mongolian"
      }
    ],
    "mfe": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mfe&fmt=json3",
        "name": "Morisyen"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mfe&fmt=srv1",
        "name": "Morisyen"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mfe&fmt=srv2",
        "name": "Morisyen"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mfe&fmt=srv3",
        "name": "Morisyen"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mfe&fmt=ttml",
        "name": "Morisyen"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=mfe&fmt=vtt",
        "name": "Morisyen"
      }
    ],
    "ne": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ne&fmt=json3",
        "name": "Nepali"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ne&fmt=srv1",
        "name": "Nepali"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ne&fmt=srv2",
        "name": "Nepali"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ne&fmt=srv3",
        "name": "Nepali"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ne&fmt=ttml",
        "name": "Nepali"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ne&fmt=vtt",
        "name": "Nepali"
      }
    ],
    "new": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=new&fmt=json3",
        "name": "Newari"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=new&fmt=srv1",
        "name": "Newari"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=new&fmt=srv2",
        "name": "Newari"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=new&fmt=srv3",
        "name": "Newari"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=new&fmt=ttml",
        "name": "Newari"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=new&fmt=vtt",
        "name": "Newari"
      }
    ],
    "nso": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nso&fmt=json3",
        "name": "Northern Sotho"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nso&fmt=srv1",
        "name": "Northern Sotho"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nso&fmt=srv2",
        "name": "Northern Sotho"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nso&fmt=srv3",
        "name": "Northern Sotho"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nso&fmt=ttml",
        "name": "Northern Sotho"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=nso&fmt=vtt",
        "name": "Northern Sotho"
      }
    ],
    "no": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=no&fmt=json3",
        "name": "Norwegian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=no&fmt=srv1",
        "name": "Norwegian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=no&fmt=srv2",
        "name": "Norwegian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=no&fmt=srv3",
        "name": "Norwegian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=no&fmt=ttml",
        "name": "Norwegian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=no&fmt=vtt",
        "name": "Norwegian"
      }
    ],
    "ny": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ny&fmt=json3",
        "name": "Nyanja"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ny&fmt=srv1",
        "name": "Nyanja"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ny&fmt=srv2",
        "name": "Nyanja"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ny&fmt=srv3",
        "name": "Nyanja"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ny&fmt=ttml",
        "name": "Nyanja"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ny&fmt=vtt",
        "name": "Nyanja"
      }
    ],
    "oc": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=oc&fmt=json3",
        "name": "Occitan"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=oc&fmt=srv1",
        "name": "Occitan"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=oc&fmt=srv2",
        "name": "Occitan"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=oc&fmt=srv3",
        "name": "Occitan"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=oc&fmt=ttml",
        "name": "Occitan"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=oc&fmt=vtt",
        "name": "Occitan"
      }
    ],
    "or": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=or&fmt=json3",
        "name": "Odia"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=or&fmt=srv1",
        "name": "Odia"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=or&fmt=srv2",
        "name": "Odia"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=or&fmt=srv3",
        "name": "Odia"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=or&fmt=ttml",
        "name": "Odia"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=or&fmt=vtt",
        "name": "Odia"
      }
    ],
    "om": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=om&fmt=json3",
        "name": "Oromo"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=om&fmt=srv1",
        "name": "Oromo"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=om&fmt=srv2",
        "name": "Oromo"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=om&fmt=srv3",
        "name": "Oromo"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=om&fmt=ttml",
        "name": "Oromo"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=om&fmt=vtt",
        "name": "Oromo"
      }
    ],
    "os": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=os&fmt=json3",
        "name": "Ossetic"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=os&fmt=srv1",
        "name": "Ossetic"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=os&fmt=srv2",
        "name": "Ossetic"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=os&fmt=srv3",
        "name": "Ossetic"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=os&fmt=ttml",
        "name": "Ossetic"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=os&fmt=vtt",
        "name": "Ossetic"
      }
    ],
    "pam": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pam&fmt=json3",
        "name": "Pampanga"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pam&fmt=srv1",
        "name": "Pampanga"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pam&fmt=srv2",
        "name": "Pampanga"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pam&fmt=srv3",
        "name": "Pampanga"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pam&fmt=ttml",
        "name": "Pampanga"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pam&fmt=vtt",
        "name": "Pampanga"
      }
    ],
    "ps": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ps&fmt=json3",
        "name": "Pashto"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ps&fmt=srv1",
        "name": "Pashto"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ps&fmt=srv2",
        "name": "Pashto"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ps&fmt=srv3",
        "name": "Pashto"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ps&fmt=ttml",
        "name": "Pashto"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ps&fmt=vtt",
        "name": "Pashto"
      }
    ],
    "fa": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fa&fmt=json3",
        "name": "Persian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fa&fmt=srv1",
        "name": "Persian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fa&fmt=srv2",
        "name": "Persian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fa&fmt=srv3",
        "name": "Persian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fa&fmt=ttml",
        "name": "Persian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fa&fmt=vtt",
        "name": "Persian"
      }
    ],
    "pl": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pl&fmt=json3",
        "name": "Polish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pl&fmt=srv1",
        "name": "Polish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pl&fmt=srv2",
        "name": "Polish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pl&fmt=srv3",
        "name": "Polish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pl&fmt=ttml",
        "name": "Polish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pl&fmt=vtt",
        "name": "Polish"
      }
    ],
    "pt": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt&fmt=json3",
        "name": "Portuguese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt&fmt=srv1",
        "name": "Portuguese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt&fmt=srv2",
        "name": "Portuguese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt&fmt=srv3",
        "name": "Portuguese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt&fmt=ttml",
        "name": "Portuguese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt&fmt=vtt",
        "name": "Portuguese"
      }
    ],
    "pt-PT": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt-PT&fmt=json3",
        "name": "Portuguese (Portugal)"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt-PT&fmt=srv1",
        "name": "Portuguese (Portugal)"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt-PT&fmt=srv2",
        "name": "Portuguese (Portugal)"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt-PT&fmt=srv3",
        "name": "Portuguese (Portugal)"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt-PT&fmt=ttml",
        "name": "Portuguese (Portugal)"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pt-PT&fmt=vtt",
        "name": "Portuguese (Portugal)"
      }
    ],
    "pa": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pa&fmt=json3",
        "name": "Punjabi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pa&fmt=srv1",
        "name": "Punjabi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pa&fmt=srv2",
        "name": "Punjabi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pa&fmt=srv3",
        "name": "Punjabi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pa&fmt=ttml",
        "name": "Punjabi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=pa&fmt=vtt",
        "name": "Punjabi"
      }
    ],
    "qu": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=qu&fmt=json3",
        "name": "Quechua"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=qu&fmt=srv1",
        "name": "Quechua"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=qu&fmt=srv2",
        "name": "Quechua"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=qu&fmt=srv3",
        "name": "Quechua"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=qu&fmt=ttml",
        "name": "Quechua"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=qu&fmt=vtt",
        "name": "Quechua"
      }
    ],
    "ro": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ro&fmt=json3",
        "name": "Romanian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ro&fmt=srv1",
        "name": "Romanian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ro&fmt=srv2",
        "name": "Romanian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ro&fmt=srv3",
        "name": "Romanian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ro&fmt=ttml",
        "name": "Romanian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ro&fmt=vtt",
        "name": "Romanian"
      }
    ],
    "rn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rn&fmt=json3",
        "name": "Rundi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rn&fmt=srv1",
        "name": "Rundi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rn&fmt=srv2",
        "name": "Rundi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rn&fmt=srv3",
        "name": "Rundi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rn&fmt=ttml",
        "name": "Rundi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=rn&fmt=vtt",
        "name": "Rundi"
      }
    ],
    "ru": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ru&fmt=json3",
        "name": "Russian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ru&fmt=srv1",
        "name": "Russian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ru&fmt=srv2",
        "name": "Russian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ru&fmt=srv3",
        "name": "Russian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ru&fmt=ttml",
        "name": "Russian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ru&fmt=vtt",
        "name": "Russian"
      }
    ],
    "sm": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sm&fmt=json3",
        "name": "Samoan"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sm&fmt=srv1",
        "name": "Samoan"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sm&fmt=srv2",
        "name": "Samoan"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sm&fmt=srv3",
        "name": "Samoan"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sm&fmt=ttml",
        "name": "Samoan"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sm&fmt=vtt",
        "name": "Samoan"
      }
    ],
    "sg": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sg&fmt=json3",
        "name": "Sango"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sg&fmt=srv1",
        "name": "Sango"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sg&fmt=srv2",
        "name": "Sango"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sg&fmt=srv3",
        "name": "Sango"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sg&fmt=ttml",
        "name": "Sango"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sg&fmt=vtt",
        "name": "Sango"
      }
    ],
    "sa": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sa&fmt=json3",
        "name": "Sanskrit"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sa&fmt=srv1",
        "name": "Sanskrit"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sa&fmt=srv2",
        "name": "Sanskrit"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sa&fmt=srv3",
        "name": "Sanskrit"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sa&fmt=ttml",
        "name": "Sanskrit"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sa&fmt=vtt",
        "name": "Sanskrit"
      }
    ],
    "gd": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gd&fmt=json3",
        "name": "Scottish Gaelic"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gd&fmt=srv1",
        "name": "Scottish Gaelic"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gd&fmt=srv2",
        "name": "Scottish Gaelic"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gd&fmt=srv3",
        "name": "Scottish Gaelic"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gd&fmt=ttml",
        "name": "Scottish Gaelic"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=gd&fmt=vtt",
        "name": "Scottish Gaelic"
      }
    ],
    "sr": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sr&fmt=json3",
        "name": "Serbian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sr&fmt=srv1",
        "name": "Serbian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sr&fmt=srv2",
        "name": "Serbian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sr&fmt=srv3",
        "name": "Serbian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sr&fmt=ttml",
        "name": "Serbian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sr&fmt=vtt",
        "name": "Serbian"
      }
    ],
    "crs": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=crs&fmt=json3",
        "name": "Seselwa Creole French"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=crs&fmt=srv1",
        "name": "Seselwa Creole French"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=crs&fmt=srv2",
        "name": "Seselwa Creole French"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=crs&fmt=srv3",
        "name": "Seselwa Creole French"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=crs&fmt=ttml",
        "name": "Seselwa Creole French"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=crs&fmt=vtt",
        "name": "Seselwa Creole French"
      }
    ],
    "sn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sn&fmt=json3",
        "name": "Shona"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sn&fmt=srv1",
        "name": "Shona"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sn&fmt=srv2",
        "name": "Shona"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sn&fmt=srv3",
        "name": "Shona"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sn&fmt=ttml",
        "name": "Shona"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sn&fmt=vtt",
        "name": "Shona"
      }
    ],
    "sd": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sd&fmt=json3",
        "name": "Sindhi"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sd&fmt=srv1",
        "name": "Sindhi"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sd&fmt=srv2",
        "name": "Sindhi"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sd&fmt=srv3",
        "name": "Sindhi"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sd&fmt=ttml",
        "name": "Sindhi"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sd&fmt=vtt",
        "name": "Sindhi"
      }
    ],
    "si": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=si&fmt=json3",
        "name": "Sinhala"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=si&fmt=srv1",
        "name": "Sinhala"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=si&fmt=srv2",
        "name": "Sinhala"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=si&fmt=srv3",
        "name": "Sinhala"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=si&fmt=ttml",
        "name": "Sinhala"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=si&fmt=vtt",
        "name": "Sinhala"
      }
    ],
    "sk": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sk&fmt=json3",
        "name": "Slovak"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sk&fmt=srv1",
        "name": "Slovak"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sk&fmt=srv2",
        "name": "Slovak"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sk&fmt=srv3",
        "name": "Slovak"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sk&fmt=ttml",
        "name": "Slovak"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sk&fmt=vtt",
        "name": "Slovak"
      }
    ],
    "sl": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sl&fmt=json3",
        "name": "Slovenian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sl&fmt=srv1",
        "name": "Slovenian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sl&fmt=srv2",
        "name": "Slovenian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sl&fmt=srv3",
        "name": "Slovenian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sl&fmt=ttml",
        "name": "Slovenian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sl&fmt=vtt",
        "name": "Slovenian"
      }
    ],
    "so": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=so&fmt=json3",
        "name": "Somali"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=so&fmt=srv1",
        "name": "Somali"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=so&fmt=srv2",
        "name": "Somali"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=so&fmt=srv3",
        "name": "Somali"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=so&fmt=ttml",
        "name": "Somali"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=so&fmt=vtt",
        "name": "Somali"
      }
    ],
    "st": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=st&fmt=json3",
        "name": "Southern Sotho"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=st&fmt=srv1",
        "name": "Southern Sotho"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=st&fmt=srv2",
        "name": "Southern Sotho"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=st&fmt=srv3",
        "name": "Southern Sotho"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=st&fmt=ttml",
        "name": "Southern Sotho"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=st&fmt=vtt",
        "name": "Southern Sotho"
      }
    ],
    "es": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=es&fmt=json3",
        "name": "Spanish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=es&fmt=srv1",
        "name": "Spanish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=es&fmt=srv2",
        "name": "Spanish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=es&fmt=srv3",
        "name": "Spanish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=es&fmt=ttml",
        "name": "Spanish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=es&fmt=vtt",
        "name": "Spanish"
      }
    ],
    "su": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=su&fmt=json3",
        "name": "Sundanese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=su&fmt=srv1",
        "name": "Sundanese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=su&fmt=srv2",
        "name": "Sundanese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=su&fmt=srv3",
        "name": "Sundanese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=su&fmt=ttml",
        "name": "Sundanese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=su&fmt=vtt",
        "name": "Sundanese"
      }
    ],
    "sw": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sw&fmt=json3",
        "name": "Swahili"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sw&fmt=srv1",
        "name": "Swahili"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sw&fmt=srv2",
        "name": "Swahili"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sw&fmt=srv3",
        "name": "Swahili"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sw&fmt=ttml",
        "name": "Swahili"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sw&fmt=vtt",
        "name": "Swahili"
      }
    ],
    "ss": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ss&fmt=json3",
        "name": "Swati"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ss&fmt=srv1",
        "name": "Swati"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ss&fmt=srv2",
        "name": "Swati"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ss&fmt=srv3",
        "name": "Swati"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ss&fmt=ttml",
        "name": "Swati"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ss&fmt=vtt",
        "name": "Swati"
      }
    ],
    "sv": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sv&fmt=json3",
        "name": "Swedish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sv&fmt=srv1",
        "name": "Swedish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sv&fmt=srv2",
        "name": "Swedish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sv&fmt=srv3",
        "name": "Swedish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sv&fmt=ttml",
        "name": "Swedish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=sv&fmt=vtt",
        "name": "Swedish"
      }
    ],
    "tg": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tg&fmt=json3",
        "name": "Tajik"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tg&fmt=srv1",
        "name": "Tajik"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tg&fmt=srv2",
        "name": "Tajik"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tg&fmt=srv3",
        "name": "Tajik"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tg&fmt=ttml",
        "name": "Tajik"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tg&fmt=vtt",
        "name": "Tajik"
      }
    ],
    "ta": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ta&fmt=json3",
        "name": "Tamil"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ta&fmt=srv1",
        "name": "Tamil"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ta&fmt=srv2",
        "name": "Tamil"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ta&fmt=srv3",
        "name": "Tamil"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ta&fmt=ttml",
        "name": "Tamil"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ta&fmt=vtt",
        "name": "Tamil"
      }
    ],
    "tt": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tt&fmt=json3",
        "name": "Tatar"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tt&fmt=srv1",
        "name": "Tatar"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tt&fmt=srv2",
        "name": "Tatar"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tt&fmt=srv3",
        "name": "Tatar"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tt&fmt=ttml",
        "name": "Tatar"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tt&fmt=vtt",
        "name": "Tatar"
      }
    ],
    "te": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=te&fmt=json3",
        "name": "Telugu"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=te&fmt=srv1",
        "name": "Telugu"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=te&fmt=srv2",
        "name": "Telugu"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=te&fmt=srv3",
        "name": "Telugu"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=te&fmt=ttml",
        "name": "Telugu"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=te&fmt=vtt",
        "name": "Telugu"
      }
    ],
    "th": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=th&fmt=json3",
        "name": "Thai"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=th&fmt=srv1",
        "name": "Thai"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=th&fmt=srv2",
        "name": "Thai"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=th&fmt=srv3",
        "name": "Thai"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=th&fmt=ttml",
        "name": "Thai"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=th&fmt=vtt",
        "name": "Thai"
      }
    ],
    "bo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bo&fmt=json3",
        "name": "Tibetan"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bo&fmt=srv1",
        "name": "Tibetan"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bo&fmt=srv2",
        "name": "Tibetan"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bo&fmt=srv3",
        "name": "Tibetan"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bo&fmt=ttml",
        "name": "Tibetan"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=bo&fmt=vtt",
        "name": "Tibetan"
      }
    ],
    "ti": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ti&fmt=json3",
        "name": "Tigrinya"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ti&fmt=srv1",
        "name": "Tigrinya"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ti&fmt=srv2",
        "name": "Tigrinya"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ti&fmt=srv3",
        "name": "Tigrinya"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ti&fmt=ttml",
        "name": "Tigrinya"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ti&fmt=vtt",
        "name": "Tigrinya"
      }
    ],
    "to": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=to&fmt=json3",
        "name": "Tongan"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=to&fmt=srv1",
        "name": "Tongan"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=to&fmt=srv2",
        "name": "Tongan"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=to&fmt=srv3",
        "name": "Tongan"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=to&fmt=ttml",
        "name": "Tongan"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=to&fmt=vtt",
        "name": "Tongan"
      }
    ],
    "ts": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ts&fmt=json3",
        "name": "Tsonga"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ts&fmt=srv1",
        "name": "Tsonga"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ts&fmt=srv2",
        "name": "Tsonga"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ts&fmt=srv3",
        "name": "Tsonga"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ts&fmt=ttml",
        "name": "Tsonga"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ts&fmt=vtt",
        "name": "Tsonga"
      }
    ],
    "tn": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tn&fmt=json3",
        "name": "Tswana"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tn&fmt=srv1",
        "name": "Tswana"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tn&fmt=srv2",
        "name": "Tswana"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tn&fmt=srv3",
        "name": "Tswana"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tn&fmt=ttml",
        "name": "Tswana"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tn&fmt=vtt",
        "name": "Tswana"
      }
    ],
    "tum": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tum&fmt=json3",
        "name": "Tumbuka"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tum&fmt=srv1",
        "name": "Tumbuka"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tum&fmt=srv2",
        "name": "Tumbuka"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tum&fmt=srv3",
        "name": "Tumbuka"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tum&fmt=ttml",
        "name": "Tumbuka"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tum&fmt=vtt",
        "name": "Tumbuka"
      }
    ],
    "tr": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tr&fmt=json3",
        "name": "Turkish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tr&fmt=srv1",
        "name": "Turkish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tr&fmt=srv2",
        "name": "Turkish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tr&fmt=srv3",
        "name": "Turkish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tr&fmt=ttml",
        "name": "Turkish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tr&fmt=vtt",
        "name": "Turkish"
      }
    ],
    "tk": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tk&fmt=json3",
        "name": "Turkmen"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tk&fmt=srv1",
        "name": "Turkmen"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tk&fmt=srv2",
        "name": "Turkmen"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tk&fmt=srv3",
        "name": "Turkmen"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tk&fmt=ttml",
        "name": "Turkmen"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=tk&fmt=vtt",
        "name": "Turkmen"
      }
    ],
    "uk": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uk&fmt=json3",
        "name": "Ukrainian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uk&fmt=srv1",
        "name": "Ukrainian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uk&fmt=srv2",
        "name": "Ukrainian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uk&fmt=srv3",
        "name": "Ukrainian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uk&fmt=ttml",
        "name": "Ukrainian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uk&fmt=vtt",
        "name": "Ukrainian"
      }
    ],
    "ur": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ur&fmt=json3",
        "name": "Urdu"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ur&fmt=srv1",
        "name": "Urdu"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ur&fmt=srv2",
        "name": "Urdu"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ur&fmt=srv3",
        "name": "Urdu"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ur&fmt=ttml",
        "name": "Urdu"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ur&fmt=vtt",
        "name": "Urdu"
      }
    ],
    "ug": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ug&fmt=json3",
        "name": "Uyghur"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ug&fmt=srv1",
        "name": "Uyghur"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ug&fmt=srv2",
        "name": "Uyghur"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ug&fmt=srv3",
        "name": "Uyghur"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ug&fmt=ttml",
        "name": "Uyghur"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ug&fmt=vtt",
        "name": "Uyghur"
      }
    ],
    "uz": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uz&fmt=json3",
        "name": "Uzbek"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uz&fmt=srv1",
        "name": "Uzbek"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uz&fmt=srv2",
        "name": "Uzbek"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uz&fmt=srv3",
        "name": "Uzbek"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uz&fmt=ttml",
        "name": "Uzbek"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=uz&fmt=vtt",
        "name": "Uzbek"
      }
    ],
    "ve": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ve&fmt=json3",
        "name": "Venda"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ve&fmt=srv1",
        "name": "Venda"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ve&fmt=srv2",
        "name": "Venda"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ve&fmt=srv3",
        "name": "Venda"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ve&fmt=ttml",
        "name": "Venda"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=ve&fmt=vtt",
        "name": "Venda"
      }
    ],
    "vi": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=vi&fmt=json3",
        "name": "Vietnamese"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=vi&fmt=srv1",
        "name": "Vietnamese"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=vi&fmt=srv2",
        "name": "Vietnamese"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=vi&fmt=srv3",
        "name": "Vietnamese"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=vi&fmt=ttml",
        "name": "Vietnamese"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=vi&fmt=vtt",
        "name": "Vietnamese"
      }
    ],
    "war": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=war&fmt=json3",
        "name": "Waray"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=war&fmt=srv1",
        "name": "Waray"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=war&fmt=srv2",
        "name": "Waray"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=war&fmt=srv3",
        "name": "Waray"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=war&fmt=ttml",
        "name": "Waray"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=war&fmt=vtt",
        "name": "Waray"
      }
    ],
    "cy": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cy&fmt=json3",
        "name": "Welsh"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cy&fmt=srv1",
        "name": "Welsh"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cy&fmt=srv2",
        "name": "Welsh"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cy&fmt=srv3",
        "name": "Welsh"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cy&fmt=ttml",
        "name": "Welsh"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=cy&fmt=vtt",
        "name": "Welsh"
      }
    ],
    "fy": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fy&fmt=json3",
        "name": "Western Frisian"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fy&fmt=srv1",
        "name": "Western Frisian"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fy&fmt=srv2",
        "name": "Western Frisian"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fy&fmt=srv3",
        "name": "Western Frisian"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fy&fmt=ttml",
        "name": "Western Frisian"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=fy&fmt=vtt",
        "name": "Western Frisian"
      }
    ],
    "wo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=wo&fmt=json3",
        "name": "Wolof"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=wo&fmt=srv1",
        "name": "Wolof"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=wo&fmt=srv2",
        "name": "Wolof"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=wo&fmt=srv3",
        "name": "Wolof"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=wo&fmt=ttml",
        "name": "Wolof"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=wo&fmt=vtt",
        "name": "Wolof"
      }
    ],
    "xh": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=xh&fmt=json3",
        "name": "Xhosa"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=xh&fmt=srv1",
        "name": "Xhosa"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=xh&fmt=srv2",
        "name": "Xhosa"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=xh&fmt=srv3",
        "name": "Xhosa"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=xh&fmt=ttml",
        "name": "Xhosa"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=xh&fmt=vtt",
        "name": "Xhosa"
      }
    ],
    "yi": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yi&fmt=json3",
        "name": "Yiddish"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yi&fmt=srv1",
        "name": "Yiddish"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yi&fmt=srv2",
        "name": "Yiddish"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yi&fmt=srv3",
        "name": "Yiddish"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yi&fmt=ttml",
        "name": "Yiddish"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yi&fmt=vtt",
        "name": "Yiddish"
      }
    ],
    "yo": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yo&fmt=json3",
        "name": "Yoruba"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yo&fmt=srv1",
        "name": "Yoruba"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yo&fmt=srv2",
        "name": "Yoruba"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yo&fmt=srv3",
        "name": "Yoruba"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yo&fmt=ttml",
        "name": "Yoruba"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=yo&fmt=vtt",
        "name": "Yoruba"
      }
    ],
    "zu": [
      {
        "ext": "json3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zu&fmt=json3",
        "name": "Zulu"
      },
      {
        "ext": "srv1",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zu&fmt=srv1",
        "name": "Zulu"
      },
      {
        "ext": "srv2",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zu&fmt=srv2",
        "name": "Zulu"
      },
      {
        "ext": "srv3",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zu&fmt=srv3",
        "name": "Zulu"
      },
      {
        "ext": "ttml",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zu&fmt=ttml",
        "name": "Zulu"
      },
      {
        "ext": "vtt",
        "url": "https://www.youtube.com/api/timedtext?v=kYfNvmF0Bqw&ei=BNT9Z9eNK771g8UP_f-euQ4&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1744713332&sparams=ip%2Cipbits%2Cexpire%2Cv%2Cei%2Ccaps%2Copi%2Cxoaf&signature=6C9A2E237A8B7C2FDD0424E69C903DE94EA9AE12.B77879968475A68E611038F2F8B767B11A0ACEFB&key=yt8&kind=asr&lang=en&tlang=zu&fmt=vtt",
        "name": "Zulu"
      }
    ]
  },
  "subtitles": {},
  "comment_count": 1800,
  "chapters": null,
  "heatmap": [
    {
      "start_time": 0.0,
      "end_time": 1.0,
      "value": 0.07893463935267468
    },
    {
      "start_time": 1.0,
      "end_time": 2.0,
      "value": 0.0
    },
    {
      "start_time": 2.0,
      "end_time": 3.0,
      "value": 0.07029640438801213
    },
    {
      "start_time": 3.0,
      "end_time": 4.0,
      "value": 0.13138800065279302
    },
    {
      "start_time": 4.0,
      "end_time": 5.0,
      "value": 0.17607304376120084
    },
    {
      "start_time": 5.0,
      "end_time": 6.0,
      "value": 0.2816648537476545
    },
    {
      "start_time": 6.0,
      "end_time": 7.0,
      "value": 0.3330843891373535
    },
    {
      "start_time": 7.0,
      "end_time": 8.0,
      "value": 0.42354110966079844
    },
    {
      "start_time": 8.0,
      "end_time": 9.0,
      "value": 0.5032724449139878
    },
    {
      "start_time": 9.0,
      "end_time": 10.0,
      "value": 0.6130797866825146
    },
    {
      "start_time": 10.0,
      "end_time": 11.0,
      "value": 0.7428436244880251
    },
    {
      "start_time": 11.0,
      "end_time": 12.0,
      "value": 0.8465887654808575
    },
    {
      "start_time": 12.0,
      "end_time": 13.0,
      "value": 0.8505737683025523
    },
    {
      "start_time": 13.0,
      "end_time": 14.0,
      "value": 0.7481297449486484
    },
    {
      "start_time": 14.0,
      "end_time": 15.0,
      "value": 0.7097087931768302
    },
    {
      "start_time": 15.0,
      "end_time": 16.0,
      "value": 0.7406242500826908
    },
    {
      "start_time": 16.0,
      "end_time": 17.0,
      "value": 0.7389993763531517
    },
    {
      "start_time": 17.0,
      "end_time": 18.0,
      "value": 0.7194166012739619
    },
    {
      "start_time": 18.0,
      "end_time": 19.0,
      "value": 0.6944613843172671
    },
    {
      "start_time": 19.0,
      "end_time": 20.0,
      "value": 0.6809495437100681
    },
    {
      "start_time": 20.0,
      "end_time": 21.0,
      "value": 0.7010100316657424
    },
    {
      "start_time": 21.0,
      "end_time": 22.0,
      "value": 0.6554396354839519
    },
    {
      "start_time": 22.0,
      "end_time": 23.0,
      "value": 0.6122435860394505
    },
    {
      "start_time": 23.0,
      "end_time": 24.0,
      "value": 0.5886567158722439
    },
    {
      "start_time": 24.0,
      "end_time": 25.0,
      "value": 0.585075900390772
    },
    {
      "start_time": 25.0,
      "end_time": 26.0,
      "value": 0.5944735607147779
    },
    {
      "start_time": 26.0,
      "end_time": 27.0,
      "value": 0.5775204406576311
    },
    {
      "start_time": 27.0,
      "end_time": 28.0,
      "value": 0.5466626667691691
    },
    {
      "start_time": 28.0,
      "end_time": 29.0,
      "value": 0.5234854678910226
    },
    {
      "start_time": 29.0,
      "end_time": 30.0,
      "value": 0.5226535325414985
    },
    {
      "start_time": 30.0,
      "end_time": 31.0,
      "value": 0.5092885398976066
    },
    {
      "start_time": 31.0,
      "end_time": 32.0,
      "value": 0.53369333087842
    },
    {
      "start_time": 32.0,
      "end_time": 33.0,
      "value": 0.5258890623554434
    },
    {
      "start_time": 33.0,
      "end_time": 34.0,
      "value": 0.5235051694849933
    },
    {
      "start_time": 34.0,
      "end_time": 35.0,
      "value": 0.5307143280045261
    },
    {
      "start_time": 35.0,
      "end_time": 36.0,
      "value": 0.5528004241732871
    },
    {
      "start_time": 36.0,
      "end_time": 37.0,
      "value": 0.6271956740986698
    },
    {
      "start_time": 37.0,
      "end_time": 38.0,
      "value": 0.6610822126189928
    },
    {
      "start_time": 38.0,
      "end_time": 39.0,
      "value": 0.7017785969398144
    },
    {
      "start_time": 39.0,
      "end_time": 40.0,
      "value": 0.7438542959477985
    },
    {
      "start_time": 40.0,
      "end_time": 41.0,
      "value": 0.7872473613320065
    },
    {
      "start_time": 41.0,
      "end_time": 42.0,
      "value": 0.8658053346432524
    },
    {
      "start_time": 42.0,
      "end_time": 43.0,
      "value": 0.9012271757287736
    },
    {
      "start_time": 43.0,
      "end_time": 44.0,
      "value": 0.9370623440692464
    },
    {
      "start_time": 44.0,
      "end_time": 45.0,
      "value": 0.9528258534471544
    },
    {
      "start_time": 45.0,
      "end_time": 46.0,
      "value": 0.97162097098595
    },
    {
      "start_time": 46.0,
      "end_time": 47.0,
      "value": 1.0
    },
    {
      "start_time": 47.0,
      "end_time": 48.0,
      "value": 0.9817518555804104
    },
    {
      "start_time": 48.0,
      "end_time": 49.0,
      "value": 0.8933201339424037
    },
    {
      "start_time": 49.0,
      "end_time": 50.0,
      "value": 0.8209657254213222
    },
    {
      "start_time": 50.0,
      "end_time": 51.0,
      "value": 0.7489990523939518
    },
    {
      "start_time": 51.0,
      "end_time": 52.0,
      "value": 0.7195364357115155
    },
    {
      "start_time": 52.0,
      "end_time": 53.0,
      "value": 0.690217417244927
    },
    {
      "start_time": 53.0,
      "end_time": 54.0,
      "value": 0.672052141385544
    },
    {
      "start_time": 54.0,
      "end_time": 55.0,
      "value": 0.6563753596429502
    },
    {
      "start_time": 55.0,
      "end_time": 56.0,
      "value": 0.6426868140176638
    },
    {
      "start_time": 56.0,
      "end_time": 57.0,
      "value": 0.6485392029730315
    },
    {
      "start_time": 57.0,
      "end_time": 58.0,
      "value": 0.6832186798733695
    },
    {
      "start_time": 58.0,
      "end_time": 59.0,
      "value": 0.6808542854876739
    },
    {
      "start_time": 59.0,
      "end_time": 60.0,
      "value": 0.6695356181969203
    },
    {
      "start_time": 60.0,
      "end_time": 61.0,
      "value": 0.6582327934250297
    },
    {
      "start_time": 61.0,
      "end_time": 62.0,
      "value": 0.6321921608170028
    },
    {
      "start_time": 62.0,
      "end_time": 63.0,
      "value": 0.62303010718378
    },
    {
      "start_time": 63.0,
      "end_time": 64.0,
      "value": 0.6116261340222257
    },
    {
      "start_time": 64.0,
      "end_time": 65.0,
      "value": 0.6037156393791804
    },
    {
      "start_time": 65.0,
      "end_time": 66.0,
      "value": 0.5922184390873937
    },
    {
      "start_time": 66.0,
      "end_time": 67.0,
      "value": 0.5873411774789657
    },
    {
      "start_time": 67.0,
      "end_time": 68.0,
      "value": 0.6263316474929874
    },
    {
      "start_time": 68.0,
      "end_time": 69.0,
      "value": 0.6158887871424554
    },
    {
      "start_time": 69.0,
      "end_time": 70.0,
      "value": 0.6141144250297986
    },
    {
      "start_time": 70.0,
      "end_time": 71.0,
      "value": 0.6140853804118831
    },
    {
      "start_time": 71.0,
      "end_time": 72.0,
      "value": 0.6138485550658028
    },
    {
      "start_time": 72.0,
      "end_time": 73.0,
      "value": 0.6561178171568183
    },
    {
      "start_time": 73.0,
      "end_time": 74.0,
      "value": 0.6730752025075052
    },
    {
      "start_time": 74.0,
      "end_time": 75.0,
      "value": 0.6847487015989469
    },
    {
      "start_time": 75.0,
      "end_time": 76.0,
      "value": 0.6932849757370808
    },
    {
      "start_time": 76.0,
      "end_time": 77.0,
      "value": 0.6980820092051128
    },
    {
      "start_time": 77.0,
      "end_time": 78.0,
      "value": 0.7411505060618453
    },
    {
      "start_time": 78.0,
      "end_time": 79.0,
      "value": 0.7348459959912333
    },
    {
      "start_time": 79.0,
      "end_time": 80.0,
      "value": 0.7253150960214053
    },
    {
      "start_time": 80.0,
      "end_time": 81.0,
      "value": 0.703069356008717
    },
    {
      "start_time": 81.0,
      "end_time": 82.0,
      "value": 0.6723450248752935
    },
    {
      "start_time": 82.0,
      "end_time": 83.0,
      "value": 0.6622157651545626
    },
    {
      "start_time": 83.0,
      "end_time": 84.0,
      "value": 0.6373606810414506
    },
    {
      "start_time": 84.0,
      "end_time": 85.0,
      "value": 0.6262256244821349
    },
    {
      "start_time": 85.0,
      "end_time": 86.0,
      "value": 0.61536151561722
    },
    {
      "start_time": 86.0,
      "end_time": 87.0,
      "value": 0.5965739131194234
    },
    {
      "start_time": 87.0,
      "end_time": 88.0,
      "value": 0.5894118759380472
    },
    {
      "start_time": 88.0,
      "end_time": 89.0,
      "value": 0.6278643096383753
    },
    {
      "start_time": 89.0,
      "end_time": 90.0,
      "value": 0.6097670753664166
    },
    {
      "start_time": 90.0,
      "end_time": 91.0,
      "value": 0.5743423907518687
    },
    {
      "start_time": 91.0,
      "end_time": 92.0,
      "value": 0.5465131783860515
    },
    {
      "start_time": 92.0,
      "end_time": 93.0,
      "value": 0.5198597652727721
    },
    {
      "start_time": 93.0,
      "end_time": 94.0,
      "value": 0.49456759012641416
    },
    {
      "start_time": 94.0,
      "end_time": 95.0,
      "value": 0.4507173258965571
    },
    {
      "start_time": 95.0,
      "end_time": 96.0,
      "value": 0.3904824443056757
    },
    {
      "start_time": 96.0,
      "end_time": 97.0,
      "value": 0.3503791388961359
    },
    {
      "start_time": 97.0,
      "end_time": 98.0,
      "value": 0.28004140178262865
    },
    {
      "start_time": 98.0,
      "end_time": 99.0,
      "value": 0.14348741977059018
    },
    {
      "start_time": 99.0,
      "end_time": 100.0,
      "value": 0.06873256497793878
    }
  ],
  "like_count": null,
  "channel": "Silicon Valley Historical Association",
  "channel_follower_count": 65900,
  "uploader": "Silicon Valley Historical Association",
  "uploader_id": "@SCVHA",
  "uploader_url": "https://www.youtube.com/@SCVHA",
  "upload_date": "20111007",
  "timestamp": 1317947203,
  "availability": "public",
  "original_url": "https://www.youtube.com/watch?v=kYfNvmF0Bqw",
  "webpage_url_basename": "watch",
  "webpage_url_domain": "youtube.com",
  "extractor": "youtube",
  "extractor_key": "Youtube",
  "playlist": null,
  "playlist_index": null,
  "display_id": "kYfNvmF0Bqw",
  "fulltitle": "Steve Jobs Secrets of Life",
  "duration_string": "1:40",
  "release_year": null,
  "is_live": false,
  "was_live": false,
  "requested_subtitles": null,
  "_has_drm": null,
  "epoch": 1744688133,
  "requested_formats": [
    {
      "asr": null,
      "filesize": 2386588,
      "format_id": "397",
      "format_note": "480p",
      "source_preference": -1,
      "fps": 30,
      "audio_channels": null,
      "height": 480,
      "quality": 7.0,
      "has_drm": false,
      "tbr": 191.824,
      "filesize_approx": 2386578,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=397&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=2386588&dur=99.532&lmt=1646450261737193&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgBgWJ49RgGU-6pv3TjU95bTg5PesM91JbQ7pFI6Ky6MYCID_vBLLs3fWJRbKJDdlsX5jW57bjyMlBIrIFYPV3jANb&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": 854,
      "language": null,
      "language_preference": -1,
      "preference": null,
      "ext": "mp4",
      "vcodec": "av01.0.04M.08",
      "acodec": "none",
      "dynamic_range": "SDR",
      "container": "mp4_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 191.824,
      "resolution": "854x480",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "397 - 854x480 (480p)"
    },
    {
      "asr": 48000,
      "filesize": 1089692,
      "format_id": "251",
      "format_note": "medium",
      "source_preference": -1,
      "fps": null,
      "audio_channels": 2,
      "height": null,
      "quality": 3.0,
      "has_drm": false,
      "tbr": 87.524,
      "filesize_approx": 1089684,
      "url": "https://rr1---sn-npoe7ned.googlevideo.com/videoplayback?expire=1744709732&ei=BNT9Z9mOI4_MqfkP3oyu8AI&ip=2404%3A7ac0%3A6e9c%3A5e75%3A100b%3A7487%3A281d%3A4dbd&id=o-AAl21RAwbe2sr5JTuB3vwe54Q8r45TCMZB2ZHrtAzwqs&itag=251&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1744688132%2C&mh=yi&mm=31%2C26&mn=sn-npoe7ned%2Csn-un57enez&ms=au%2Conr&mv=m&mvi=1&pl=36&rms=au%2Cau&pcm2=yes&initcwndbps=4865000&bui=AccgBcMqwhwz3XuPdoKgz8vcHZerwbcyXouZVwddWxB5IORWN73trdkE_c_--HhJyxYbWFSCRPZfwNY9&spc=_S3wKkhbghGWnS9Bg69Md3YpR-JRCCPYZC0RQ7v5nsmNvS8WS5l89M2V&vprv=1&svpuc=1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=1089692&dur=99.601&lmt=1646449573912384&mt=1744687757&fvip=4&keepalive=yes&c=IOS&txp=4532434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgG7x6MIMld9HOcqebtQ6e4JX5Vjk-ZLNuLY2EmjtaSAICIFa5qzk0ITDyILZqtO2GmSyjN1-29QMDxSFxJIGNgsej&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=ACuhMU0wRQIhAKZuiOS41YNpZRFeEynHI8eLnK2ZXp6ga4TP4e5K0AKNAiAlF5vFe3WKzzGZ87jVOpKXP_w3Rv_ECsPWFpDhjZR98Q%3D%3D",
      "width": null,
      "language": "en",
      "language_preference": -1,
      "preference": null,
      "ext": "webm",
      "vcodec": "none",
      "acodec": "opus",
      "dynamic_range": null,
      "container": "webm_dash",
      "downloader_options": {
        "http_chunk_size": 10485760
      },
      "protocol": "https",
      "audio_ext": "webm",
      "video_ext": "none",
      "vbr": 0,
      "abr": 87.524,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "251 - audio only (medium)"
    }
  ],
  "format": "397 - 854x480 (480p)+251 - audio only (medium)",
  "format_id": "397+251",
  "ext": "webm",
  "protocol": "https+https",
  "language": "en",
  "format_note": "480p+medium",
  "filesize_approx": 3476280,
  "tbr": 279.348,
  "width": 854,
  "height": 480,
  "resolution": "854x480",
  "fps": 30,
  "dynamic_range": "SDR",
  "vcodec": "av01.0.04M.08",
  "vbr": 191.824,
  "stretched_ratio": null,
  "aspect_ratio": 1.78,
  "acodec": "opus",
  "abr": 87.524,
  "asr": 48000,
  "audio_channels": 2,
  "_filename": "Steve Jobs Secrets of Life [kYfNvmF0Bqw].webm",
  "filename": "Steve Jobs Secrets of Life [kYfNvmF0Bqw].webm",
  "_type": "video",
  "_version": {
    "version": "2024.12.13",
    "current_git_head": null,
    "release_git_head": "54216696261bc07cacd9a837c501d9e0b7fed09e",
    "repository": "yt-dlp/yt-dlp"
  }
}

```

# bilibili 的 json
```bash
yt-dlp --dump-json https://www.bilibili.com/video/BV1GQ4y1V72D | jq


{
  "uploader": "一点五编程",
  "uploader_id": "328353019",
  "like_count": 86,
  "tags": [
    "Vim"
  ],
  "thumbnail": "http://i2.hdslb.com/bfs/archive/65e53e5b9907473a63135e58d57f1c071b4fd5bc.jpg",
  "description": "",
  "timestamp": 1701707250,
  "view_count": 5116,
  "comment_count": 53,
  "id": "BV1GQ4y1V72D",
  "_old_archive_ids": [
    "bilibili 706822208_part1"
  ],
  "title": "超级精简且健康的Vim配置",
  "http_headers": {
    "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
  },
  "formats": [
    {
      "url": "https://upos-sz-estgcos.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&deadline=1744691874&gen=playurlv3&os=upos&og=cos&oi=2875863220&mid=0&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&tag=&nbs=1&uipk=5&platform=pc&upsig=16cfae997a8c046e0cfed3101742014d&uparams=e,deadline,gen,os,og,oi,mid,trid,tag,nbs,uipk,platform&bvc=vod&nettype=0&bw=35976&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,3",
      "ext": "m4a",
      "acodec": "mp4a.40.5",
      "vcodec": "none",
      "tbr": 35.892,
      "filesize": null,
      "format_id": "30216",
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 35.892,
      "resolution": "audio only",
      "aspect_ratio": null,
      "filesize_approx": 1524494,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      },
      "format": "30216 - audio only"
    },
    {
      "url": "https://upos-sz-estgoss.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&platform=pc&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&oi=2875863220&og=cos&deadline=1744691874&tag=&nbs=1&uipk=5&mid=0&gen=playurlv3&os=upos&upsig=a96cfabb1a44102b278ac4cb6fcf6d59&uparams=e,platform,trid,oi,og,deadline,tag,nbs,uipk,mid,gen,os&bvc=vod&nettype=0&bw=45331&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,3",
      "ext": "m4a",
      "acodec": "mp4a.40.5",
      "vcodec": "none",
      "tbr": 45.224,
      "filesize": null,
      "format_id": "30232",
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 45.224,
      "resolution": "audio only",
      "aspect_ratio": null,
      "filesize_approx": 1920866,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      },
      "format": "30232 - audio only"
    },
    {
      "url": "https://upos-sz-estgoss.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&nbs=1&platform=pc&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&oi=2875863220&gen=playurlv3&uipk=5&mid=0&deadline=1744691874&tag=&os=upos&og=cos&upsig=f9f6394a1ec9110179f304c4fcf85504&uparams=e,nbs,platform,trid,oi,gen,uipk,mid,deadline,tag,os,og&bvc=vod&nettype=0&bw=45331&dl=0&f=u_0_0&agrr=0&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&orderid=0,3",
      "ext": "m4a",
      "acodec": "mp4a.40.5",
      "vcodec": "none",
      "tbr": 45.224,
      "filesize": null,
      "format_id": "30280",
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 45.224,
      "resolution": "audio only",
      "aspect_ratio": null,
      "filesize_approx": 1920866,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      },
      "format": "30280 - audio only"
    },
    {
      "url": "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&oi=2875863220&mid=0&deadline=1744691874&gen=playurlv3&os=08cbv&tag=&uipk=5&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&nbs=1&platform=pc&og=hw&upsig=4fb294f380128048d091f8f068382ee9&uparams=e,oi,mid,deadline,gen,os,tag,uipk,trid,nbs,platform,og&bvc=vod&nettype=0&bw=355230&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,3",
      "ext": "mp4",
      "fps": 30.303,
      "width": 640,
      "height": 360,
      "vcodec": "avc1.64001E",
      "acodec": "none",
      "dynamic_range": "SDR",
      "tbr": 354.499,
      "filesize": null,
      "quality": 16,
      "format_id": "30016",
      "format": "360P 流畅",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 354.499,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "filesize_approx": 15057167,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      }
    },
    {
      "url": "https://upos-sz-estghw.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&gen=playurlv3&deadline=1744691874&tag=&nbs=1&platform=pc&oi=2875863220&mid=0&uipk=5&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&os=upos&og=hw&upsig=51965e753b3005b10e0fdeacc0755d08&uparams=e,gen,deadline,tag,nbs,platform,oi,mid,uipk,trid,os,og&bvc=vod&nettype=0&bw=791164&dl=0&f=u_0_0&agrr=0&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&orderid=0,3",
      "ext": "mp4",
      "fps": 30.303,
      "width": 852,
      "height": 480,
      "vcodec": "avc1.64001F",
      "acodec": "none",
      "dynamic_range": "SDR",
      "tbr": 789.536,
      "filesize": null,
      "quality": 32,
      "format_id": "30032",
      "format": "480P 清晰",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 789.536,
      "resolution": "852x480",
      "aspect_ratio": 1.77,
      "filesize_approx": 33535146,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      }
    },
    {
      "url": "https://upos-sz-estgoss.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30064.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&gen=playurlv3&os=upos&deadline=1744691874&uipk=5&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&platform=pc&oi=2875863220&og=cos&mid=0&tag=&nbs=1&upsig=7bc02ecc4c14c07d113839b0e82f3fcf&uparams=e,gen,os,deadline,uipk,trid,platform,oi,og,mid,tag,nbs&bvc=vod&nettype=0&bw=1167127&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,3",
      "ext": "mp4",
      "fps": 30.303,
      "width": 1280,
      "height": 720,
      "vcodec": "avc1.640028",
      "acodec": "none",
      "dynamic_range": "SDR",
      "tbr": 1164.726,
      "filesize": null,
      "quality": 64,
      "format_id": "30064",
      "format": "720P 高清",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 1164.726,
      "resolution": "1280x720",
      "aspect_ratio": 1.78,
      "filesize_approx": 49471154,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      }
    },
    {
      "url": "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&oi=2875863220&gen=playurlv3&og=hw&platform=pc&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&mid=0&deadline=1744691874&tag=&nbs=1&os=08cbv&upsig=def87855d1c067ec0c650a699ed35151&uparams=e,uipk,oi,gen,og,platform,trid,mid,deadline,tag,nbs,os&bvc=vod&nettype=0&bw=1164552&agrr=0&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&dl=0&f=u_0_0&orderid=0,3",
      "ext": "mp4",
      "fps": 30.303,
      "width": 1920,
      "height": 1080,
      "vcodec": "avc1.640032",
      "acodec": "none",
      "dynamic_range": "SDR",
      "tbr": 1162.155,
      "filesize": null,
      "quality": 80,
      "format_id": "30080",
      "format": "1080P 高清",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 1162.155,
      "resolution": "1920x1080",
      "aspect_ratio": 1.78,
      "filesize_approx": 49361952,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      }
    }
  ],
  "duration": 339.796,
  "chapters": null,
  "subtitles": {},
  "webpage_url": "https://www.bilibili.com/video/BV1GQ4y1V72D",
  "original_url": "https://www.bilibili.com/video/BV1GQ4y1V72D",
  "webpage_url_basename": "BV1GQ4y1V72D",
  "webpage_url_domain": "bilibili.com",
  "extractor": "BiliBili",
  "extractor_key": "BiliBili",
  "playlist": null,
  "playlist_index": null,
  "thumbnails": [
    {
      "url": "http://i2.hdslb.com/bfs/archive/65e53e5b9907473a63135e58d57f1c071b4fd5bc.jpg",
      "id": "0"
    }
  ],
  "display_id": "BV1GQ4y1V72D",
  "fulltitle": "超级精简且健康的Vim配置",
  "duration_string": "5:39",
  "upload_date": "20231204",
  "release_year": null,
  "requested_subtitles": null,
  "_has_drm": null,
  "epoch": 1744684674,
  "requested_formats": [
    {
      "url": "https://upos-sz-mirror08c.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&oi=2875863220&gen=playurlv3&og=hw&platform=pc&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&mid=0&deadline=1744691874&tag=&nbs=1&os=08cbv&upsig=def87855d1c067ec0c650a699ed35151&uparams=e,uipk,oi,gen,og,platform,trid,mid,deadline,tag,nbs,os&bvc=vod&nettype=0&bw=1164552&agrr=0&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&dl=0&f=u_0_0&orderid=0,3",
      "ext": "mp4",
      "fps": 30.303,
      "width": 1920,
      "height": 1080,
      "vcodec": "avc1.640032",
      "acodec": "none",
      "dynamic_range": "SDR",
      "tbr": 1162.155,
      "filesize": null,
      "quality": 80,
      "format_id": "30080",
      "format": "1080P 高清",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 1162.155,
      "resolution": "1920x1080",
      "aspect_ratio": 1.78,
      "filesize_approx": 49361952,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      }
    },
    {
      "url": "https://upos-sz-estgoss.bilivideo.com/upgcxcode/01/78/1354557801/1354557801-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&nbs=1&platform=pc&trid=1f49a86b7cdf4d0c9b6df0b98a73fc0u&oi=2875863220&gen=playurlv3&uipk=5&mid=0&deadline=1744691874&tag=&os=upos&og=cos&upsig=f9f6394a1ec9110179f304c4fcf85504&uparams=e,nbs,platform,trid,oi,gen,uipk,mid,deadline,tag,os,og&bvc=vod&nettype=0&bw=45331&dl=0&f=u_0_0&agrr=0&buvid=106ACF6D-4359-7016-DBDF-C1C5C647003973593infoc&build=0&orderid=0,3",
      "ext": "m4a",
      "acodec": "mp4a.40.5",
      "vcodec": "none",
      "tbr": 45.224,
      "filesize": null,
      "format_id": "30280",
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 45.224,
      "resolution": "audio only",
      "aspect_ratio": null,
      "filesize_approx": 1920866,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.bilibili.com/video/BV1GQ4y1V72D"
      },
      "format": "30280 - audio only"
    }
  ],
  "format": "1080P 高清+30280 - audio only",
  "format_id": "30080+30280",
  "ext": "mp4",
  "protocol": "https+https",
  "language": null,
  "format_note": null,
  "filesize_approx": 51282818,
  "tbr": 1207.379,
  "width": 1920,
  "height": 1080,
  "resolution": "1920x1080",
  "fps": 30.303,
  "dynamic_range": "SDR",
  "vcodec": "avc1.640032",
  "vbr": 1162.155,
  "stretched_ratio": null,
  "aspect_ratio": 1.78,
  "acodec": "mp4a.40.5",
  "abr": 45.224,
  "asr": null,
  "audio_channels": null,
  "_filename": "超级精简且健康的Vim配置 [BV1GQ4y1V72D].mp4",
  "filename": "超级精简且健康的Vim配置 [BV1GQ4y1V72D].mp4",
  "_type": "video",
  "_version": {
    "version": "2025.01.15",
    "current_git_head": null,
    "release_git_head": "c8541f8b13e743fcfa06667530d13fee8686e22a",
    "repository": "yt-dlp/yt-dlp"
  }
}
```

# twitter/x 的 json
```bash
yt-dlp --dump-json https://x.com/i/status/1899531225468969240 | jq


{
  "id": "1899529435558113280",
  "title": "OpenAI Developers - We're launching new tools to help developers build reliable and powerful AI agents. 🤖🔧  Timestamps: 01:54 Web search 02:41 File search 03:22 Computer use 04:07 Responses API 10:17 Agents SDK",
  "description": "We're launching new tools to help developers build reliable and powerful AI agents. 🤖🔧  Timestamps: 01:54 Web search 02:41 File search 03:22 Computer use 04:07 Responses API 10:17 Agents SDK https://t.co/vY514tdmDz",
  "uploader": "OpenAI Developers",
  "timestamp": 1741718510.0,
  "channel_id": "1633874951508721686",
  "uploader_id": "OpenAIDevs",
  "uploader_url": "https://twitter.com/OpenAIDevs",
  "like_count": 4970,
  "repost_count": 918,
  "comment_count": 274,
  "age_limit": 0,
  "tags": [],
  "formats": [
    {
      "format_id": "hls-audio-32000-Audio",
      "format_note": "Audio",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/mp4a/32000/pyx03apjauOrHEDR.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "language": null,
      "ext": "mp4",
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "vcodec": "none",
      "tbr": 32,
      "audio_ext": "mp4",
      "video_ext": "none",
      "vbr": 0,
      "abr": 32,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-audio-32000-Audio - audio only (Audio)"
    },
    {
      "format_id": "hls-audio-64000-Audio",
      "format_note": "Audio",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/mp4a/64000/zC-w-nfpCxpvUgwh.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "language": null,
      "ext": "mp4",
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "vcodec": "none",
      "tbr": 64,
      "audio_ext": "mp4",
      "video_ext": "none",
      "vbr": 0,
      "abr": 64,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-audio-64000-Audio - audio only (Audio)"
    },
    {
      "format_id": "hls-audio-128000-Audio",
      "format_note": "Audio",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/mp4a/128000/rVbtZOi9TenpITRO.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "language": null,
      "ext": "mp4",
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "vcodec": "none",
      "tbr": 128,
      "audio_ext": "mp4",
      "video_ext": "none",
      "vbr": 0,
      "abr": 128,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-audio-128000-Audio - audio only (Audio)"
    },
    {
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/vid/avc1/480x270/oiu56dT4MWMvrXm4.mp4?tag=16",
      "format_id": "http-288",
      "tbr": 288,
      "width": 480,
      "height": 270,
      "protocol": "https",
      "ext": "mp4",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "480x270",
      "dynamic_range": "SDR",
      "aspect_ratio": 1.78,
      "filesize_approx": 42195816,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "http-288 - 480x270"
    },
    {
      "format_id": "hls-82",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/avc1/480x270/GorN_bN51pEDa9T9.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "tbr": 82.586,
      "ext": "mp4",
      "fps": null,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "width": 480,
      "height": 270,
      "vcodec": "avc1.4D401E",
      "acodec": "none",
      "dynamic_range": "SDR",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 82.586,
      "resolution": "480x270",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-82 - 480x270"
    },
    {
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/vid/avc1/640x360/uuafPOjqIFkyHA37.mp4?tag=16",
      "format_id": "http-832",
      "tbr": 832,
      "width": 640,
      "height": 360,
      "protocol": "https",
      "ext": "mp4",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "640x360",
      "dynamic_range": "SDR",
      "aspect_ratio": 1.78,
      "filesize_approx": 121899024,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "http-832 - 640x360"
    },
    {
      "format_id": "hls-186",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/avc1/640x360/u3xo-EttINZN_phW.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "tbr": 186.726,
      "ext": "mp4",
      "fps": null,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "width": 640,
      "height": 360,
      "vcodec": "avc1.4D401F",
      "acodec": "none",
      "dynamic_range": "SDR",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 186.726,
      "resolution": "640x360",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-186 - 640x360"
    },
    {
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/vid/avc1/1280x720/ONS6SVx4OGR1m8Gz.mp4?tag=16",
      "format_id": "http-2176",
      "tbr": 2176,
      "width": 1280,
      "height": 720,
      "protocol": "https",
      "ext": "mp4",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "1280x720",
      "dynamic_range": "SDR",
      "aspect_ratio": 1.78,
      "filesize_approx": 318812832,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "http-2176 - 1280x720"
    },
    {
      "format_id": "hls-465",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/avc1/1280x720/YvXedUPgL0kPZKu7.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "tbr": 465.371,
      "ext": "mp4",
      "fps": null,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "width": 1280,
      "height": 720,
      "vcodec": "avc1.640028",
      "acodec": "none",
      "dynamic_range": "SDR",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 465.371,
      "resolution": "1280x720",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-465 - 1280x720"
    },
    {
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/vid/avc1/1920x1080/WODhnnBxPY5neZjF.mp4?tag=16",
      "format_id": "http-10368",
      "tbr": 10368,
      "width": 1920,
      "height": 1080,
      "protocol": "https",
      "ext": "mp4",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "1920x1080",
      "dynamic_range": "SDR",
      "aspect_ratio": 1.78,
      "filesize_approx": 1519049376,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "http-10368 - 1920x1080"
    },
    {
      "format_id": "hls-826",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/avc1/1920x1080/tZQIYgpyPFrcg3VM.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "tbr": 826.746,
      "ext": "mp4",
      "fps": null,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "width": 1920,
      "height": 1080,
      "vcodec": "avc1.640032",
      "acodec": "none",
      "dynamic_range": "SDR",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 826.746,
      "resolution": "1920x1080",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-826 - 1920x1080"
    }
  ],
  "subtitles": {},
  "thumbnails": [
    {
      "id": "thumb",
      "url": "https://pbs.twimg.com/amplify_video_thumb/1899529435558113280/img/0SpgleCBC6q7e33u.jpg?name=thumb",
      "width": 150,
      "height": 150,
      "resolution": "150x150"
    },
    {
      "id": "small",
      "url": "https://pbs.twimg.com/amplify_video_thumb/1899529435558113280/img/0SpgleCBC6q7e33u.jpg?name=small",
      "width": 680,
      "height": 383,
      "resolution": "680x383"
    },
    {
      "id": "medium",
      "url": "https://pbs.twimg.com/amplify_video_thumb/1899529435558113280/img/0SpgleCBC6q7e33u.jpg?name=medium",
      "width": 1200,
      "height": 675,
      "resolution": "1200x675"
    },
    {
      "id": "large",
      "url": "https://pbs.twimg.com/amplify_video_thumb/1899529435558113280/img/0SpgleCBC6q7e33u.jpg?name=large",
      "width": 1920,
      "height": 1080,
      "resolution": "1920x1080"
    },
    {
      "id": "orig",
      "url": "https://pbs.twimg.com/amplify_video_thumb/1899529435558113280/img/0SpgleCBC6q7e33u.jpg?name=orig",
      "width": 1920,
      "height": 1080,
      "resolution": "1920x1080"
    }
  ],
  "view_count": null,
  "duration": 1172.106,
  "_format_sort_fields": [
    "res",
    "proto:m3u8",
    "br",
    "size"
  ],
  "display_id": "1899531225468969240",
  "_old_archive_ids": [
    "twitter 1899531225468969240"
  ],
  "webpage_url": "https://x.com/i/status/1899531225468969240",
  "original_url": "https://x.com/i/status/1899531225468969240",
  "webpage_url_basename": "1899531225468969240",
  "webpage_url_domain": "x.com",
  "extractor": "twitter",
  "extractor_key": "Twitter",
  "playlist": null,
  "playlist_index": null,
  "thumbnail": "https://pbs.twimg.com/amplify_video_thumb/1899529435558113280/img/0SpgleCBC6q7e33u.jpg?name=orig",
  "fulltitle": "OpenAI Developers - We're launching new tools to help developers build reliable and powerful AI agents. 🤖🔧  Timestamps: 01:54 Web search 02:41 File search 03:22 Computer use 04:07 Responses API 10:17 Agents SDK",
  "duration_string": "19:32",
  "upload_date": "20250311",
  "release_year": null,
  "requested_subtitles": null,
  "_has_drm": null,
  "epoch": 1744685112,
  "requested_formats": [
    {
      "format_id": "hls-826",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/avc1/1920x1080/tZQIYgpyPFrcg3VM.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "tbr": 826.746,
      "ext": "mp4",
      "fps": null,
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "width": 1920,
      "height": 1080,
      "vcodec": "avc1.640032",
      "acodec": "none",
      "dynamic_range": "SDR",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 826.746,
      "resolution": "1920x1080",
      "aspect_ratio": 1.78,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-826 - 1920x1080"
    },
    {
      "format_id": "hls-audio-128000-Audio",
      "format_note": "Audio",
      "format_index": null,
      "url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/mp4a/128000/rVbtZOi9TenpITRO.m3u8",
      "manifest_url": "https://video.twimg.com/amplify_video/1899529435558113280/pl/20S7z3WQRUcOFrC0.m3u8?tag=16&v=654",
      "language": null,
      "ext": "mp4",
      "protocol": "m3u8_native",
      "preference": null,
      "quality": null,
      "has_drm": false,
      "vcodec": "none",
      "tbr": 128,
      "audio_ext": "mp4",
      "video_ext": "none",
      "vbr": 0,
      "abr": 128,
      "resolution": "audio only",
      "aspect_ratio": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
      },
      "format": "hls-audio-128000-Audio - audio only (Audio)"
    }
  ],
  "format": "hls-826 - 1920x1080+hls-audio-128000-Audio - audio only (Audio)",
  "format_id": "hls-826+hls-audio-128000-Audio",
  "ext": "mp4",
  "protocol": "m3u8_native+m3u8_native",
  "language": null,
  "format_note": "Audio",
  "filesize_approx": null,
  "tbr": 954.746,
  "width": 1920,
  "height": 1080,
  "resolution": "1920x1080",
  "fps": null,
  "dynamic_range": "SDR",
  "vcodec": "avc1.640032",
  "vbr": 826.746,
  "stretched_ratio": null,
  "aspect_ratio": 1.78,
  "acodec": null,
  "abr": 128,
  "asr": null,
  "audio_channels": null,
  "_filename": "OpenAI Developers - We're launching new tools to help developers build reliable and powerful AI agents. 🤖🔧  Timestamps： 01_54 Web search 02_41 File search 03_22 Computer use 04_07 Responses API 10_17 Agents SDK [1899529435558113280].mp4",
  "filename": "OpenAI Developers - We're launching new tools to help developers build reliable and powerful AI agents. 🤖🔧  Timestamps： 01_54 Web search 02_41 File search 03_22 Computer use 04_07 Responses API 10_17 Agents SDK [1899529435558113280].mp4",
  "_type": "video",
  "_version": {
    "version": "2025.01.15",
    "current_git_head": null,
    "release_git_head": "c8541f8b13e743fcfa06667530d13fee8686e22a",
    "repository": "yt-dlp/yt-dlp"
  }
}
```


# TikTok 的 json
```bash
yt-dlp --dump-json https://www.tiktok.com/@openai/video/7450235598566116650 | jq


{
  "id": "7450235598566116650",
  "formats": [
    {
      "ext": "mp4",
      "vcodec": "h264",
      "acodec": "aac",
      "format_id": "h264_540p_225079-0",
      "tbr": 225,
      "quality": 1,
      "format_note": null,
      "preference": -1,
      "filesize": 4096159,
      "width": 576,
      "height": 1024,
      "url": "https://v16-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/oMuJtxtI0fj5gIgQQCLOAGDGAkkKHHoeeRyIyO/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=438&bt=219&cs=0&ds=6&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=5&rc=ZTVpNWQ4Z2Y7PDxkODw5aUBpM3FtOm05cmc7dzMzZzczNEBiNF41NTA2XmIxNDRfNmI0YSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=c5782aabb255b1ca176c02c6d4bf2b33&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "576x1024",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "h264_540p_225079-0 - 576x1024"
    },
    {
      "ext": "mp4",
      "vcodec": "h264",
      "acodec": "aac",
      "format_id": "h264_540p_225079-1",
      "tbr": 225,
      "quality": 1,
      "format_note": null,
      "preference": -1,
      "filesize": 4096159,
      "width": 576,
      "height": 1024,
      "url": "https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/oMuJtxtI0fj5gIgQQCLOAGDGAkkKHHoeeRyIyO/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=438&bt=219&cs=0&ds=6&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=5&rc=ZTVpNWQ4Z2Y7PDxkODw5aUBpM3FtOm05cmc7dzMzZzczNEBiNF41NTA2XmIxNDRfNmI0YSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=c5782aabb255b1ca176c02c6d4bf2b33&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "576x1024",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "h264_540p_225079-1 - 576x1024"
    },
    {
      "ext": "mp4",
      "vcodec": "h264",
      "acodec": "aac",
      "format_id": "h264_540p_477314-0",
      "tbr": 477,
      "quality": 1,
      "format_note": null,
      "preference": -1,
      "filesize": 8686523,
      "width": 576,
      "height": 1024,
      "url": "https://v16-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/o8TjGIA5QxOgymIfICJkukLQfykdGHeROjAAtt/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=932&bt=466&cs=0&ds=6&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=0&rc=Omc1NDloaGY5PGU6ZDc4aEBpM3FtOm05cmc7dzMzZzczNEAzMjEtY2A0NjExYDMxLjAzYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=c13a083aea49313da842417f4a3e09c4&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "576x1024",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "h264_540p_477314-0 - 576x1024"
    },
    {
      "ext": "mp4",
      "vcodec": "h264",
      "acodec": "aac",
      "format_id": "h264_540p_477314-1",
      "tbr": 477,
      "quality": 1,
      "format_note": null,
      "preference": -1,
      "filesize": 8686523,
      "width": 576,
      "height": 1024,
      "url": "https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/o8TjGIA5QxOgymIfICJkukLQfykdGHeROjAAtt/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=932&bt=466&cs=0&ds=6&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=0&rc=Omc1NDloaGY5PGU6ZDc4aEBpM3FtOm05cmc7dzMzZzczNEAzMjEtY2A0NjExYDMxLjAzYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=c13a083aea49313da842417f4a3e09c4&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "576x1024",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "h264_540p_477314-1 - 576x1024"
    },
    {
      "ext": "mp4",
      "vcodec": "h265",
      "acodec": "aac",
      "format_id": "bytevc1_540p_243270-0",
      "tbr": 243,
      "quality": 1,
      "format_note": null,
      "preference": -1,
      "filesize": 4427228,
      "width": 576,
      "height": 1024,
      "url": "https://v16-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/o4XYOD2ISEFID92fEgnkfSnTkNR5ZAkQEE8BQu/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=474&bt=237&cs=2&ds=6&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=11&rc=PDlkNWZkNztmNmU7N2c0N0BpM3FtOm05cmc7dzMzZzczNEAvMzAuXy9jXl4xMTA0Ll8tYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=1ee9603e3d0ae38b2d5c28b3b0993250&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "576x1024",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "bytevc1_540p_243270-0 - 576x1024"
    },
    {
      "ext": "mp4",
      "vcodec": "h265",
      "acodec": "aac",
      "format_id": "bytevc1_540p_243270-1",
      "tbr": 243,
      "quality": 1,
      "format_note": null,
      "preference": -1,
      "filesize": 4427228,
      "width": 576,
      "height": 1024,
      "url": "https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/o4XYOD2ISEFID92fEgnkfSnTkNR5ZAkQEE8BQu/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=474&bt=237&cs=2&ds=6&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=11&rc=PDlkNWZkNztmNmU7N2c0N0BpM3FtOm05cmc7dzMzZzczNEAvMzAuXy9jXl4xMTA0Ll8tYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=1ee9603e3d0ae38b2d5c28b3b0993250&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "576x1024",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "bytevc1_540p_243270-1 - 576x1024"
    },
    {
      "ext": "mp4",
      "vcodec": "h265",
      "acodec": "aac",
      "format_id": "bytevc1_720p_297472-0",
      "tbr": 297,
      "quality": 2,
      "format_note": null,
      "preference": -1,
      "filesize": 5413632,
      "width": 720,
      "height": 1280,
      "url": "https://v16-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/ocYnPd28FAKnQRw9gIFSZkSD2ffX5dIEDEBZkE/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=580&bt=290&cs=2&ds=3&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=14&rc=ZmRnZTZoOTc1Njo5MzdoZkBpM3FtOm05cmc7dzMzZzczNEBiYmEwMF4xXjYxMmMxMjMzYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=ba8e49a4289ba3a70e274da19e729642&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "720x1280",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "bytevc1_720p_297472-0 - 720x1280"
    },
    {
      "ext": "mp4",
      "vcodec": "h265",
      "acodec": "aac",
      "format_id": "bytevc1_720p_297472-1",
      "tbr": 297,
      "quality": 2,
      "format_note": null,
      "preference": -1,
      "filesize": 5413632,
      "width": 720,
      "height": 1280,
      "url": "https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/ocYnPd28FAKnQRw9gIFSZkSD2ffX5dIEDEBZkE/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=580&bt=290&cs=2&ds=3&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=14&rc=ZmRnZTZoOTc1Njo5MzdoZkBpM3FtOm05cmc7dzMzZzczNEBiYmEwMF4xXjYxMmMxMjMzYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=ba8e49a4289ba3a70e274da19e729642&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "720x1280",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "bytevc1_720p_297472-1 - 720x1280"
    },
    {
      "ext": "mp4",
      "vcodec": "h265",
      "acodec": "aac",
      "format_id": "bytevc1_1080p_416350-0",
      "tbr": 416,
      "quality": 3,
      "format_note": null,
      "preference": -1,
      "filesize": 7577054,
      "width": 1080,
      "height": 1920,
      "url": "https://v16-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/ooIBH52fdkCnFDAnI2VSRkXDgEUESnQfY8ZrEO/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=812&bt=406&cs=2&ds=4&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=15&rc=ZmU2ZTRoZTU8N2VoaWY2M0BpM3FtOm05cmc7dzMzZzczNEAwXmAxYjM1NTIxMjBjXjVjYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=74950e85eaabc85326bd9d7f4c8ea8af&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "1080x1920",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "bytevc1_1080p_416350-0 - 1080x1920"
    },
    {
      "ext": "mp4",
      "vcodec": "h265",
      "acodec": "aac",
      "format_id": "bytevc1_1080p_416350-1",
      "tbr": 416,
      "quality": 3,
      "format_note": null,
      "preference": -1,
      "filesize": 7577054,
      "width": 1080,
      "height": 1920,
      "url": "https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/ooIBH52fdkCnFDAnI2VSRkXDgEUESnQfY8ZrEO/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=812&bt=406&cs=2&ds=4&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=15&rc=ZmU2ZTRoZTU8N2VoaWY2M0BpM3FtOm05cmc7dzMzZzczNEAwXmAxYjM1NTIxMjBjXjVjYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=74950e85eaabc85326bd9d7f4c8ea8af&tk=tt_chain_token",
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "resolution": "1080x1920",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
      },
      "format": "bytevc1_1080p_416350-1 - 1080x1920"
    }
  ],
  "subtitles": {},
  "http_headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.19 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-us,en;q=0.5",
    "Sec-Fetch-Mode": "navigate",
    "Referer": "https://www.tiktok.com/@openai/video/7450235598566116650"
  },
  "channel": "OpenAI",
  "channel_id": "MS4wLjABAAAAU0e2Ju3Gon2D0Lye3r8qjnGX4XS_JWElRx6vjtGumNCrybQ9x5yeprPriqaGJrZU",
  "uploader": "openai",
  "uploader_id": "7256178298626032683",
  "channel_url": "https://www.tiktok.com/@MS4wLjABAAAAU0e2Ju3Gon2D0Lye3r8qjnGX4XS_JWElRx6vjtGumNCrybQ9x5yeprPriqaGJrZU",
  "uploader_url": "https://www.tiktok.com/@openai",
  "track": "original sound",
  "artists": [
    "OpenAI"
  ],
  "duration": 145,
  "title": "ChatGPT can now work directly with more coding and notetaking apps—through voice or text—on macOS. 🧑‍💻 Work with your code in context—and with the power of o1 and o1 pro mode—with expanded support for coding apps like Warp, IntelliJ IDEA, PyCharm, and more. 📝 We’ve added support for note-taking apps like Apple Notes, Notion, and Quip. 🗣️ And you can use Advanced Voice when you work with these apps.  This beta is available to Plus, Pro, Team, Enterprise, and Edu users through the ChatGPT app for macOS. We plan to bring this feature to Windows and Free users next year.",
  "description": "ChatGPT can now work directly with more coding and notetaking apps—through voice or text—on macOS. 🧑‍💻 Work with your code in context—and with the power of o1 and o1 pro mode—with expanded support for coding apps like Warp, IntelliJ IDEA, PyCharm, and more. 📝 We’ve added support for note-taking apps like Apple Notes, Notion, and Quip. 🗣️ And you can use Advanced Voice when you work with these apps.  This beta is available to Plus, Pro, Team, Enterprise, and Edu users through the ChatGPT app for macOS. We plan to bring this feature to Windows and Free users next year.",
  "timestamp": 1734643154,
  "view_count": 51700,
  "like_count": 1577,
  "repost_count": 57,
  "comment_count": 64,
  "thumbnails": [
    {
      "id": "dynamicCover",
      "url": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oIAARgAjSDOA4SWNaeIeELyIjH0G2AukdQeGSa?lk3s=81f88b70&x-expires=1744855200&x-signature=jMEqGjROjXhxgn7AhCfFJ%2BssUXw%3D&shp=81f88b70&shcp=-",
      "preference": -2
    },
    {
      "id": "cover",
      "url": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/oIAARgAjSDOA4SWNaeIeELyIjH0G2AukdQeGSa?lk3s=81f88b70&x-expires=1744855200&x-signature=jMEqGjROjXhxgn7AhCfFJ%2BssUXw%3D&shp=81f88b70&shcp=-",
      "preference": -1
    },
    {
      "id": "originCover",
      "url": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o42ZDfn2EERSIdjXYBngFBfkISRIAP5SxDMU84?lk3s=81f88b70&x-expires=1744855200&x-signature=BRE0vMCIMK8dbVQmWCtl%2FFqt0xI%3D&shp=81f88b70&shcp=-",
      "preference": -1
    }
  ],
  "webpage_url": "https://www.tiktok.com/@openai/video/7450235598566116650",
  "original_url": "https://www.tiktok.com/@openai/video/7450235598566116650",
  "webpage_url_basename": "7450235598566116650",
  "webpage_url_domain": "tiktok.com",
  "extractor": "TikTok",
  "extractor_key": "TikTok",
  "playlist": null,
  "playlist_index": null,
  "thumbnail": "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/o42ZDfn2EERSIdjXYBngFBfkISRIAP5SxDMU84?lk3s=81f88b70&x-expires=1744855200&x-signature=BRE0vMCIMK8dbVQmWCtl%2FFqt0xI%3D&shp=81f88b70&shcp=-",
  "display_id": "7450235598566116650",
  "fulltitle": "ChatGPT can now work directly with more coding and notetaking apps—through voice or text—on macOS. 🧑‍💻 Work with your code in context—and with the power of o1 and o1 pro mode—with expanded support for coding apps like Warp, IntelliJ IDEA, PyCharm, and more. 📝 We’ve added support for note-taking apps like Apple Notes, Notion, and Quip. 🗣️ And you can use Advanced Voice when you work with these apps.  This beta is available to Plus, Pro, Team, Enterprise, and Edu users through the ChatGPT app for macOS. We plan to bring this feature to Windows and Free users next year.",
  "duration_string": "2:25",
  "upload_date": "20241219",
  "release_year": null,
  "artist": "OpenAI",
  "requested_subtitles": null,
  "_has_drm": null,
  "epoch": 1744685299,
  "ext": "mp4",
  "vcodec": "h265",
  "acodec": "aac",
  "format_id": "bytevc1_1080p_416350-1",
  "tbr": 416,
  "quality": 3,
  "format_note": null,
  "preference": -1,
  "filesize": 7577054,
  "width": 1080,
  "height": 1920,
  "url": "https://v19-webapp-prime.tiktok.com/video/tos/maliva/tos-maliva-ve-0068c799-us/ooIBH52fdkCnFDAnI2VSRkXDgEUESnQfY8ZrEO/?a=1988&bti=ODszNWYuMDE6&ch=0&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C&cv=1&br=812&bt=406&cs=2&ds=4&ft=I~da4o1xD12NvKyfXeIxRchNglBF-UjNSlopiX&mime_type=video_mp4&qs=15&rc=ZmU2ZTRoZTU8N2VoaWY2M0BpM3FtOm05cmc7dzMzZzczNEAwXmAxYjM1NTIxMjBjXjVjYSM2ZnNqMmRrb2ZgLS1kMS9zcw%3D%3D&btag=e00090000&expire=1744858244&l=20250415104819D1ADEF1A30694DC46FBC&ply_type=2&policy=2&signature=74950e85eaabc85326bd9d7f4c8ea8af&tk=tt_chain_token",
  "protocol": "https",
  "video_ext": "mp4",
  "audio_ext": "none",
  "vbr": null,
  "abr": null,
  "resolution": "1080x1920",
  "dynamic_range": "SDR",
  "aspect_ratio": 0.56,
  "cookies": "ttwid=1%7CP7qjTT9z0N9h4BGqJsRMeyaYe39NGTrzf7NY3e3SeVc%7C1744685299%7Cf94ef60e3e8e4c4bed61edd21f6fb7b7209705df06282adaf1dad4d36adec1b4; Domain=.tiktok.com; Path=/; Expires=1775789299; tt_csrf_token=aOJi77Yy-7B6keZ98kWZNiK6vTphDZj0N088; Domain=.tiktok.com; Path=/; Secure; tt_chain_token=\"gghQaNcksU3F1zcnAIpbSw==\"; Domain=.tiktok.com; Path=/; Secure; Expires=1760237299; msToken=lkESmqUN-yelXILkjQ4vFTwWwudJIxNtr0r-sl_I3vxjudEHV3E5YqSR0B-PN3q9BE8KYgGoD0Y6WCaSqdBl6GvrSgsCw9albeQR; Domain=.tiktok.com; Path=/; Secure; Expires=1745549299",
  "format": "bytevc1_1080p_416350-1 - 1080x1920",
  "_filename": "ChatGPT can now work directly with more coding and notetaking apps—through voice or text—on macOS. 🧑‍💻 Work with your code in context—and with the power of o1 and o1 pro mode—with expanded support for coding apps like Warp, IntelliJ IDEA, PyCharm, and more. 📝 We’ve added support for note-taking apps like Apple Notes, Notion, and Quip. 🗣️ And you can use Advanced Voice when you work with these apps.  This beta is available to Plus, Pro, Team, Enterprise, and Edu users through the ChatGPT app for macOS. We plan to bring this feature to Windows and Free users next year. [7450235598566116650].mp4",
  "filename": "ChatGPT can now work directly with more coding and notetaking apps—through voice or text—on macOS. 🧑‍💻 Work with your code in context—and with the power of o1 and o1 pro mode—with expanded support for coding apps like Warp, IntelliJ IDEA, PyCharm, and more. 📝 We’ve added support for note-taking apps like Apple Notes, Notion, and Quip. 🗣️ And you can use Advanced Voice when you work with these apps.  This beta is available to Plus, Pro, Team, Enterprise, and Edu users through the ChatGPT app for macOS. We plan to bring this feature to Windows and Free users next year. [7450235598566116650].mp4",
  "_type": "video",
  "_version": {
    "version": "2025.01.15",
    "current_git_head": null,
    "release_git_head": "c8541f8b13e743fcfa06667530d13fee8686e22a",
    "repository": "yt-dlp/yt-dlp"
  }
}
```


# douyin 抖音 的 json 遇到 cookies问题
```bash
yt-dlp --dump-json https://www.douyin.com/video/7489020775630949647 | jq



```


# instagram 的 json
```bash
yt-dlp --dump-json https://www.instagram.com/reel/DIblpCrAIOo | jq


{
  "id": "DIblpCrAIOo",
  "formats": [
    {
      "format_id": "dash-2768372110040548ad",
      "manifest_url": null,
      "ext": "m4a",
      "width": null,
      "height": null,
      "tbr": 66.101,
      "asr": 44100,
      "fps": null,
      "language": null,
      "format_note": "DASH audio",
      "filesize": null,
      "container": "m4a_dash",
      "vcodec": "none",
      "acodec": "mp4a.40.5",
      "dynamic_range": null,
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t16/f2/m69/AQM0a-TbeUeRG9AoNMjryCN4p1fgQulnsktX48brc7dQwfkTAJCaohqeKHeqFRNdNoNx47t2PmNf2c__mAnFg-Sh.mp4?strext=1&_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=OGIX4qQa410Q7kNvwHaHMqC&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfHHaNTY-CZFiE-_Sf-GKb-Bw9_RpEVf-srbTk7uTDpG5g&oe=68039EC7",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 66.101,
      "resolution": "audio only",
      "aspect_ratio": null,
      "filesize_approx": 1141721,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-2768372110040548ad - audio only (DASH audio)"
    },
    {
      "url": "https://scontent-sin6-3.cdninstagram.com/o1/v/t16/f2/m86/AQP2BfpPuY2NEHGNdDL6c7SV5yMHyMe3ZllNMP-gKHqSQ0A949J0IKb2yTFSGuHcgmvcEnXYkKphDS_rp8jfDhKb1wJNpQpMvVuLyMM.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuMTI3Ni5iYXNlbGluZSJ9&_nc_cat=110&vs=1925381361203235_1437699945&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9BRDQxQTMxQUI1QUI3OEI0NTIxRDZCNzU2MTYxMThBQl92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dPMGFTUjB5cnZUVDh3MEVBSjdRV0lRVDVjbGRicV9FQUFBRhUCAsgBACgAGAAbABUAACaUr9beoY7RPxUCKAJDMywXQGFFul41P30YEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&_nc_rid=5e1a6c3e99&ccb=9-4&oh=00_AfHs_zrXxhWs_aLA5RGO_6FtephNYQ6yJUp-TBpuitWCHw&oe=67FFA45E&_nc_sid=d885a2",
      "width": 640,
      "height": 1136,
      "protocol": "https",
      "ext": "mp4",
      "video_ext": "mp4",
      "audio_ext": "none",
      "vbr": null,
      "abr": null,
      "tbr": null,
      "resolution": "640x1136",
      "dynamic_range": "SDR",
      "aspect_ratio": 0.56,
      "filesize_approx": null,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format_id": "1",
      "format": "1 - 640x1136"
    },
    {
      "format_id": "dash-1212782510457336vd",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1276,
      "height": 718,
      "tbr": 102.531,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.31.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin6-3.cdninstagram.com/o1/v/t2/f2/m367/AQNJ3CzqQASRjfB19aKwPjovmwoRLCr1qc8dpyKmGEkwISWnr38poMk6qq8xDcrSERuoiwgNh3eKvEasIMO1QBLPvcjSqIAQznLfEZ8.mp4?_nc_cat=106&_nc_sid=9ca052&_nc_ht=scontent-sin6-3.cdninstagram.com&_nc_ohc=n3UyLOy-XfIQ7kNvwF2e51k&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfF9b2UT-y35RTLhQtmFAaqm1d5cd5Yn9muNGlkaKiWwXw&oe=68039AD7",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 102.531,
      "resolution": "1276x718",
      "aspect_ratio": 1.78,
      "filesize_approx": 1770953,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-1212782510457336vd - 1276x718 (DASH video)"
    },
    {
      "format_id": "dash-1834056847437025v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1276,
      "height": 718,
      "tbr": 173.895,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.31.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQOsitxiNLM8pLcEsR5uRjTtYehG-Mxy3ONwDU1gMx9Y3BLJTH5T5BdBH4OPKhCglIMbEspL2r_ndVhp1X3he9Ju3yWriQbkof9MBZs.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=fmTtXbYq77IQ7kNvwEsCw9o&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfGDfN4MLRf_wJvtnfcXPRMliwwoGcGVkJoHVqmBw3QWoA&oe=68038D64",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 173.895,
      "resolution": "1276x718",
      "aspect_ratio": 1.78,
      "filesize_approx": 3003579,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-1834056847437025v - 1276x718 (DASH video)"
    },
    {
      "format_id": "dash-9950859838271130v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1276,
      "height": 718,
      "tbr": 261.445,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.31.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQNPTyfNtFxD5lTQESzj9hrP2dUiaNQZmTLbtT00MF3rU_seRldgC3tAF8q9837XZVsXod0OpG9IASJyLvWoOcb2tcM0U9Oo69qsBkY.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=tkiE_JMzD7EQ7kNvwGknQOW&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfHU9C8cvMxugcnChPTBBgQ8nXVtOJ3fJ6KMZICMlFxzrw&oe=6803B90E",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 261.445,
      "resolution": "1276x718",
      "aspect_ratio": 1.78,
      "filesize_approx": 4515776,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-9950859838271130v - 1276x718 (DASH video)"
    },
    {
      "format_id": "dash-594697960274443v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1276,
      "height": 718,
      "tbr": 372.975,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.31.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQMjr9gPuez4yWgkqy6chjRP1cUP38CHv0RCtS0DWQb9qS6fJ_ZXqiW-QT5MwYCu5xGXlnjg9k0wonIhbkAevVr6lTYyKDaTWFwEja8.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=C961109i8TAQ7kNvwG4uAZa&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfEWMAtMiaqyNU0rSkhAvw9LB71cnge-YmZDJDOQcpdXWQ&oe=68039CD4",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 372.975,
      "resolution": "1276x718",
      "aspect_ratio": 1.78,
      "filesize_approx": 6442164,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-594697960274443v - 1276x718 (DASH video)"
    },
    {
      "format_id": "dash-540396925779743v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1276,
      "height": 718,
      "tbr": 528.869,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.31.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQP3NZ76Vidrfg4WflbDTmoTxNFY1IE5gKpC8r7Bb7kWt4ZlUZ8AqJkUT7cCKSBkPtWbczr2shLBnUU5KPASBmt5K2-ACPIDoB7qioc.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=8SYJapwZuPUQ7kNvwFTdgMF&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfFL8KuTqgaf7Y1I8NuiiI1E5wLzr8FOPYhEut83ZsDV2A&oe=6803ADCF",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 528.869,
      "resolution": "1276x718",
      "aspect_ratio": 1.78,
      "filesize_approx": 9134823,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-540396925779743v - 1276x718 (DASH video)"
    },
    {
      "format_id": "dash-1017002596526630v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1276,
      "height": 718,
      "tbr": 710.953,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.31.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQMRnq0sVt21LecIsWW2AWRiOSB-fHX_xurrQhM7jm-JqxiJpAbVk-F_DCOwrcKhUnYw3su3BCKxPZ6kjGHBERPQ8cDc8ZSTMv_eCus.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=OHZJyjIkMxwQ7kNvwEgT4nj&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfHv1p_Sd5cew8-REEEl_HmYfrfbQJvM43uIU3bR4AQOUg&oe=68038C7B",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 710.953,
      "resolution": "1276x718",
      "aspect_ratio": 1.78,
      "filesize_approx": 12279846,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-1017002596526630v - 1276x718 (DASH video)"
    },
    {
      "format_id": "dash-676398318418002v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1916,
      "height": 1080,
      "tbr": 1040.031,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.40.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQNZyKMJprJ-kGqQAN7q2MCIQHT2k6R5pP0htZjg17D2U1tlDodF85jQ447T1cG0hRZdB5bXr_qTx9Dae9BCZBrZtdkThDMxfjUb-d0.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=AFOkLAC4lzAQ7kNvwHVyRcV&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfFop8471jDMpeSbk_kJZlYq0twlwasSM3m0KWrE4uTzwg&oe=6803ADA9",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 1040.031,
      "resolution": "1916x1080",
      "aspect_ratio": 1.77,
      "filesize_approx": 17963805,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-676398318418002v - 1916x1080 (DASH video)"
    }
  ],
  "title": "Video by blakelively",
  "description": "Every friendship has its twists. Another Simple Favor is on Prime Video May 1.",
  "duration": 138.179,
  "timestamp": 1744642544,
  "uploader_id": "1437529575",
  "uploader": "Blake Lively",
  "channel": "blakelively",
  "like_count": 343772,
  "comment_count": 8,
  "comments": [
    {
      "author": "ashleylongshoreart",
      "author_id": "25306715",
      "id": "18035871329634685",
      "text": "Can NOT wait to see you in this!!! ❤️❤️❤️❤️",
      "timestamp": 1744681584
    },
    {
      "author": "samanthamstone",
      "author_id": "176140498",
      "id": "17940603356994798",
      "text": "Can’t wait!!!!!!! ✨✨",
      "timestamp": 1744672845
    },
    {
      "author": "blakelythornton",
      "author_id": "247577213",
      "id": "18083095189713787",
      "text": "Regina George Meets Patrick Bateman is back… and she’s mad as hell",
      "timestamp": 1744663356
    },
    {
      "author": "lavieannrose",
      "author_id": "13838513",
      "id": "17963491289871247",
      "text": "SOOO excited!!!",
      "timestamp": 1744651037
    },
    {
      "author": "kristoferbuckle",
      "author_id": "211501112",
      "id": "18037063565626947",
      "text": "I can’t wait for everyone to see this! It’s soo good..So many surprises ❤️",
      "timestamp": 1744646978
    },
    {
      "author": "theadventurine",
      "author_id": "1402161799",
      "id": "18113916553465011",
      "text": "Can’t wait",
      "timestamp": 1744643177
    },
    {
      "author": "donsaladino",
      "author_id": "179770595",
      "id": "18042160577390624",
      "text": "🙌🙌🙌🙌",
      "timestamp": 1744642821
    },
    {
      "author": "enamelle",
      "author_id": "35743151",
      "id": "18093952666562351",
      "text": "❤️❤️",
      "timestamp": 1744642665
    }
  ],
  "thumbnails": [
    {
      "url": "https://scontent-sin11-1.cdninstagram.com/v/t51.2885-15/491442367_18501626641025576_6178752041997105286_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2QHrnVfZSwJcSxULVaVlmGdUi0g0GCVzA357Id8_BTDeqmqF2HjzdIkdMhO2n9KkOa0wAFo8XKtACs7JCTleXtHV&_nc_ohc=rHRTj0mNoKQQ7kNvwHRlGyC&_nc_gid=jwe3QOU70hA1uvznQe2h0w&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfGIisNxaY3iMTsV9CxG6lehjqQKV0ZMwx7K2PLV8n3Scg&oe=68038799&_nc_sid=d885a2",
      "width": 640,
      "height": 1136,
      "id": "0",
      "resolution": "640x1136"
    },
    {
      "url": "https://scontent-sin11-1.cdninstagram.com/v/t51.2885-15/491442367_18501626641025576_6178752041997105286_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2QHrnVfZSwJcSxULVaVlmGdUi0g0GCVzA357Id8_BTDeqmqF2HjzdIkdMhO2n9KkOa0wAFo8XKtACs7JCTleXtHV&_nc_ohc=rHRTj0mNoKQQ7kNvwHRlGyC&_nc_gid=jwe3QOU70hA1uvznQe2h0w&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfGIisNxaY3iMTsV9CxG6lehjqQKV0ZMwx7K2PLV8n3Scg&oe=68038799&_nc_sid=d885a2",
      "width": 750,
      "height": 1332,
      "id": "1",
      "resolution": "750x1332"
    },
    {
      "url": "https://scontent-sin11-1.cdninstagram.com/v/t51.2885-15/491442367_18501626641025576_6178752041997105286_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2QHrnVfZSwJcSxULVaVlmGdUi0g0GCVzA357Id8_BTDeqmqF2HjzdIkdMhO2n9KkOa0wAFo8XKtACs7JCTleXtHV&_nc_ohc=rHRTj0mNoKQQ7kNvwHRlGyC&_nc_gid=jwe3QOU70hA1uvznQe2h0w&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfGIisNxaY3iMTsV9CxG6lehjqQKV0ZMwx7K2PLV8n3Scg&oe=68038799&_nc_sid=d885a2",
      "width": 1080,
      "height": 1918,
      "id": "2",
      "resolution": "1080x1918"
    }
  ],
  "http_headers": {
    "Referer": "https://www.instagram.com/"
  },
  "webpage_url": "https://www.instagram.com/reel/DIblpCrAIOo",
  "original_url": "https://www.instagram.com/reel/DIblpCrAIOo",
  "webpage_url_basename": "DIblpCrAIOo",
  "webpage_url_domain": "instagram.com",
  "extractor": "Instagram",
  "extractor_key": "Instagram",
  "playlist": null,
  "playlist_index": null,
  "thumbnail": "https://scontent-sin11-1.cdninstagram.com/v/t51.2885-15/491442367_18501626641025576_6178752041997105286_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_cat=1&_nc_oc=Q6cZ2QHrnVfZSwJcSxULVaVlmGdUi0g0GCVzA357Id8_BTDeqmqF2HjzdIkdMhO2n9KkOa0wAFo8XKtACs7JCTleXtHV&_nc_ohc=rHRTj0mNoKQQ7kNvwHRlGyC&_nc_gid=jwe3QOU70hA1uvznQe2h0w&edm=ANTKIIoBAAAA&ccb=7-5&oh=00_AfGIisNxaY3iMTsV9CxG6lehjqQKV0ZMwx7K2PLV8n3Scg&oe=68038799&_nc_sid=d885a2",
  "display_id": "DIblpCrAIOo",
  "fulltitle": "Video by blakelively",
  "duration_string": "2:18",
  "upload_date": "20250414",
  "release_year": null,
  "requested_subtitles": null,
  "_has_drm": null,
  "epoch": 1744686581,
  "requested_formats": [
    {
      "format_id": "dash-676398318418002v",
      "manifest_url": null,
      "ext": "mp4",
      "width": 1916,
      "height": 1080,
      "tbr": 1040.031,
      "asr": null,
      "fps": null,
      "language": null,
      "format_note": "DASH video",
      "filesize": null,
      "container": "mp4_dash",
      "vcodec": "vp09.00.40.08.00.01.01.01.00",
      "acodec": "none",
      "dynamic_range": "SDR",
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t2/f2/m367/AQNZyKMJprJ-kGqQAN7q2MCIQHT2k6R5pP0htZjg17D2U1tlDodF85jQ447T1cG0hRZdB5bXr_qTx9Dae9BCZBrZtdkThDMxfjUb-d0.mp4?_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=AFOkLAC4lzAQ7kNvwHVyRcV&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfFop8471jDMpeSbk_kJZlYq0twlwasSM3m0KWrE4uTzwg&oe=6803ADA9",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "video_ext": "mp4",
      "audio_ext": "none",
      "abr": 0,
      "vbr": 1040.031,
      "resolution": "1916x1080",
      "aspect_ratio": 1.77,
      "filesize_approx": 17963805,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-676398318418002v - 1916x1080 (DASH video)"
    },
    {
      "format_id": "dash-2768372110040548ad",
      "manifest_url": null,
      "ext": "m4a",
      "width": null,
      "height": null,
      "tbr": 66.101,
      "asr": 44100,
      "fps": null,
      "language": null,
      "format_note": "DASH audio",
      "filesize": null,
      "container": "m4a_dash",
      "vcodec": "none",
      "acodec": "mp4a.40.5",
      "dynamic_range": null,
      "url": "https://scontent-sin11-1.cdninstagram.com/o1/v/t16/f2/m69/AQM0a-TbeUeRG9AoNMjryCN4p1fgQulnsktX48brc7dQwfkTAJCaohqeKHeqFRNdNoNx47t2PmNf2c__mAnFg-Sh.mp4?strext=1&_nc_cat=1&_nc_sid=9ca052&_nc_ht=scontent-sin11-1.cdninstagram.com&_nc_ohc=OGIX4qQa410Q7kNvwHaHMqC&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjo1NTI2MDU1MjExOTYzNzMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxMzgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_zt=28&oh=00_AfHHaNTY-CZFiE-_Sf-GKb-Bw9_RpEVf-srbTk7uTDpG5g&oe=68039EC7",
      "manifest_stream_number": 0,
      "is_dash_periods": true,
      "protocol": "https",
      "audio_ext": "m4a",
      "video_ext": "none",
      "vbr": 0,
      "abr": 66.101,
      "resolution": "audio only",
      "aspect_ratio": null,
      "filesize_approx": 1141721,
      "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.41 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate",
        "Referer": "https://www.instagram.com/"
      },
      "format": "dash-2768372110040548ad - audio only (DASH audio)"
    }
  ],
  "format": "dash-676398318418002v - 1916x1080 (DASH video)+dash-2768372110040548ad - audio only (DASH audio)",
  "format_id": "dash-676398318418002v+dash-2768372110040548ad",
  "ext": "mp4",
  "protocol": "https+https",
  "language": null,
  "format_note": "DASH video+DASH audio",
  "filesize_approx": 19105526,
  "tbr": 1106.132,
  "width": 1916,
  "height": 1080,
  "resolution": "1916x1080",
  "fps": null,
  "dynamic_range": "SDR",
  "vcodec": "vp09.00.40.08.00.01.01.01.00",
  "vbr": 1040.031,
  "stretched_ratio": null,
  "aspect_ratio": 1.77,
  "acodec": "mp4a.40.5",
  "abr": 66.101,
  "asr": 44100,
  "audio_channels": null,
  "_filename": "Video by blakelively [DIblpCrAIOo].mp4",
  "filename": "Video by blakelively [DIblpCrAIOo].mp4",
  "_type": "video",
  "_version": {
    "version": "2025.01.15",
    "current_git_head": null,
    "release_git_head": "c8541f8b13e743fcfa06667530d13fee8686e22a",
    "repository": "yt-dlp/yt-dlp"
  }
}
```

# 小宇宙 抖音 的 json 
```bash
yt-dlp --dump-json https://www.xiaoyuzhoufm.com/episode/6705366b6c7f81778694a697 | jq


{
  "id": "ltH-kMJCAsCq1of1P9zdJG14xy1x",
  "uploader": "www.xiaoyuzhoufm.com",
  "title": "EP49《思考快与慢》：让你的大脑比别人的更好用！",
  "age_limit": 0,
  "http_headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.15 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-us,en;q=0.5",
    "Sec-Fetch-Mode": "navigate",
    "Referer": "https://www.xiaoyuzhoufm.com/episode/6705366b6c7f81778694a697"
  },
  "url": "https://media.xyzcdn.net/ltH-kMJCAsCq1of1P9zdJG14xy1x.m4a",
  "description": "听《纵横四海》上小宇宙。 人类使用说明书。\n\n\n\n\n微博：携隐Melody\n\n公众号：携隐Melody\n\n小红书：携隐Melody\n\n抖音：携隐Melody\n\n\n加入听友群：公众号「携隐Melody」回复「进群」\n\nBGM歌单：公众号「携隐Melody」回复「歌单」\n\n商务合作：+vx「xymario」回复「合作」",
  "thumbnail": "https://image.xyzcdn.net/FlkyIXfSCECptMqf29Z5WOPqCYVs.png",
  "webpage_url": "https://www.xiaoyuzhoufm.com/episode/6705366b6c7f81778694a697",
  "original_url": "https://www.xiaoyuzhoufm.com/episode/6705366b6c7f81778694a697",
  "webpage_url_basename": "6705366b6c7f81778694a697",
  "webpage_url_domain": "xiaoyuzhoufm.com",
  "extractor": "generic",
  "extractor_key": "Generic",
  "playlist": null,
  "playlist_index": null,
  "thumbnails": [
    {
      "url": "https://image.xyzcdn.net/FlkyIXfSCECptMqf29Z5WOPqCYVs.png",
      "id": "0"
    }
  ],
  "display_id": "ltH-kMJCAsCq1of1P9zdJG14xy1x",
  "fulltitle": "EP49《思考快与慢》：让你的大脑比别人的更好用！",
  "release_year": null,
  "requested_subtitles": null,
  "_has_drm": null,
  "protocol": "https",
  "ext": "m4a",
  "video_ext": "m4a",
  "audio_ext": "none",
  "vbr": null,
  "abr": null,
  "tbr": null,
  "resolution": null,
  "dynamic_range": "SDR",
  "aspect_ratio": null,
  "filesize_approx": null,
  "format_id": "0",
  "format": "0 - unknown",
  "epoch": 1744686826,
  "_filename": "EP49《思考快与慢》：让你的大脑比别人的更好用！ [ltH-kMJCAsCq1of1P9zdJG14xy1x].m4a",
  "filename": "EP49《思考快与慢》：让你的大脑比别人的更好用！ [ltH-kMJCAsCq1of1P9zdJG14xy1x].m4a",
  "_type": "video",
  "_version": {
    "version": "2025.01.15",
    "current_git_head": null,
    "release_git_head": "c8541f8b13e743fcfa06667530d13fee8686e22a",
    "repository": "yt-dlp/yt-dlp"
  }
}
```