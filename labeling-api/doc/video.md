# Group Video

## Get all videos [/api/video]

### Get all videos [GET]

This routes simply returns all videos saved in our database

+ Response 200 (application/json)

    + Body

            {
              "result": [
                {
                  "id": "16b00780792d045c496513f01f006f09",
                  "name": "anno_shortBotrxV",
                  "metaData": {
                    "format": "avi",
                    "width": 1024,
                    "height": 620,
                    "fps": null,
                    "duration": 5,
                    "sizeInBytes": "1259850.000000",
                    "frames": null,
                    "raw": {
                      "format": {
                        "filename": "\/var\/cache\/labeling_api\/anno_shortBotrxV",
                        "nb_streams": 1,
                        "format_name": "avi",
                        "format_long_name": "AVI (Audio Video Interleaved)",
                        "start_time": "0.000000",
                        "duration": "5.000000",
                        "size": "1259850.000000",
                        "bit_rate": "2015760.000000",
                        "tags": {
                          "encoder": "Lavf54.20.4"
                        }
                      },
                      "streams": [
                        {
                          "index": 0,
                          "codec_name": "mpeg4",
                          "codec_long_name": "MPEG-4 part 2",
                          "codec_type": "video",
                          "codec_time_base": "1\/22",
                          "codec_tag_string": "XVID",
                          "codec_tag": "0x44495658",
                          "profile": "Advanced Simple Profile",
                          "width": 1024,
                          "height": 620,
                          "has_b_frames": 1,
                          "sample_aspect_ratio": "1:1",
                          "display_aspect_ratio": "256:155",
                          "pix_fmt": "yuv420p",
                          "level": 5,
                          "avg_frame_rate": "0\/0",
                          "time_base": "1\/22",
                          "start_time": "0.000000",
                          "duration": "5.000000",
                          "nb_frames": 110
                        }
                      ]
                    },
                    "numberOfFrames": 110
                  },
                  "imageTypeConvertedStatus": {
                    "source": true,
                    "sourceJpg": true,
                    "thumbnail": true
                  }
                }
              ]
            }

## Video by id [/api/video/{id}]

+ Parameters

    + id: `05c1a74d8eda4a16a355519c0f003504` (string, required) - The id of the video-entity.

### Get a video by id [GET]

Get a video specified by id

+ Response 200 (application/json)

    + Body

            {
              "result": {
                "id": "16b00780792d045c496513f01f006f09",
                "name": "anno_shortBotrxV",
                "metaData": {
                  "format": "avi",
                  "width": 1024,
                  "height": 620,
                  "fps": null,
                  "duration": 5,
                  "sizeInBytes": "1259850.000000",
                  "frames": null,
                  "raw": {
                    "format": {
                      "filename": "\/var\/cache\/labeling_api\/anno_shortBotrxV",
                      "nb_streams": 1,
                      "format_name": "avi",
                      "format_long_name": "AVI (Audio Video Interleaved)",
                      "start_time": "0.000000",
                      "duration": "5.000000",
                      "size": "1259850.000000",
                      "bit_rate": "2015760.000000",
                      "tags": {
                        "encoder": "Lavf54.20.4"
                      }
                    },
                    "streams": [
                      {
                        "index": 0,
                        "codec_name": "mpeg4",
                        "codec_long_name": "MPEG-4 part 2",
                        "codec_type": "video",
                        "codec_time_base": "1\/22",
                        "codec_tag_string": "XVID",
                        "codec_tag": "0x44495658",
                        "profile": "Advanced Simple Profile",
                        "width": 1024,
                        "height": 620,
                        "has_b_frames": 1,
                        "sample_aspect_ratio": "1:1",
                        "display_aspect_ratio": "256:155",
                        "pix_fmt": "yuv420p",
                        "level": 5,
                        "avg_frame_rate": "0\/0",
                        "time_base": "1\/22",
                        "start_time": "0.000000",
                        "duration": "5.000000",
                        "nb_frames": 110
                      }
                    ]
                  },
                  "numberOfFrames": 110
                },
                "imageTypeConvertedStatus": {
                  "source": true,
                  "sourceJpg": true,
                  "thumbnail": true
                }
              }
            }
