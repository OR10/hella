<?php
$meta                 = new AppBundle\Model\Video\MetaData();
$meta->format         = 'mov,mp4,m4a,3gp,3g2,mj2';
$meta->width          = 1920;
$meta->height         = 1080;
$meta->fps            = 25.0;
$meta->duration       = '210.520000';
$meta->sizeInBytes    = 64;
$meta->numberOfFrames = '5263';
$meta->raw            = array(
    'streams' =>
        array(
            0 =>
                array(
                    'index'                => 0,
                    'codec_name'           => 'h264',
                    'codec_long_name'      => 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
                    'profile'              => 'High',
                    'codec_type'           => 'video',
                    'codec_time_base'      => '1/50',
                    'codec_tag_string'     => 'avc1',
                    'codec_tag'            => '0x31637661',
                    'width'                => 1920,
                    'height'               => 1080,
                    'coded_width'          => 1920,
                    'coded_height'         => 1080,
                    'has_b_frames'         => 2,
                    'sample_aspect_ratio'  => '1:1',
                    'display_aspect_ratio' => '16:9',
                    'pix_fmt'              => 'yuv420p',
                    'level'                => 41,
                    'color_range'          => 'tv',
                    'color_space'          => 'bt709',
                    'color_transfer'       => 'bt709',
                    'color_primaries'      => 'bt709',
                    'chroma_location'      => 'left',
                    'refs'                 => 1,
                    'is_avc'               => 'true',
                    'nal_length_size'      => '4',
                    'r_frame_rate'         => '25/1',
                    'avg_frame_rate'       => '25/1',
                    'time_base'            => '1/90000',
                    'start_pts'            => 0,
                    'start_time'           => '0.000000',
                    'duration_ts'          => 18946800,
                    'duration'             => '210.520000',
                    'bit_rate'             => '1227961',
                    'bits_per_raw_sample'  => '8',
                    'nb_frames'            => '5263',
                    'disposition'          =>
                        array(
                            'default'          => 1,
                            'dub'              => 0,
                            'original'         => 0,
                            'comment'          => 0,
                            'lyrics'           => 0,
                            'karaoke'          => 0,
                            'forced'           => 0,
                            'hearing_impaired' => 0,
                            'visual_impaired'  => 0,
                            'clean_effects'    => 0,
                            'attached_pic'     => 0,
                            'timed_thumbnails' => 0,
                        ),
                    'tags'                 =>
                        array(
                            'creation_time' => '2017-01-03T13:51:21.000000Z',
                            'language'      => 'und',
                            'handler_name'  => 'VideoHandler',
                        ),
                ),
            1 =>
                array(
                    'index'            => 1,
                    'codec_name'       => 'aac',
                    'codec_long_name'  => 'AAC (Advanced Audio Coding)',
                    'profile'          => 'LC',
                    'codec_type'       => 'audio',
                    'codec_time_base'  => '1/48000',
                    'codec_tag_string' => 'mp4a',
                    'codec_tag'        => '0x6134706d',
                    'sample_fmt'       => 'fltp',
                    'sample_rate'      => '48000',
                    'channels'         => 2,
                    'channel_layout'   => 'stereo',
                    'bits_per_sample'  => 0,
                    'r_frame_rate'     => '0/0',
                    'avg_frame_rate'   => '0/0',
                    'time_base'        => '1/48000',
                    'start_pts'        => 0,
                    'start_time'       => '0.000000',
                    'duration_ts'      => 10107904,
                    'duration'         => '210.581333',
                    'bit_rate'         => '146713',
                    'nb_frames'        => '9871',
                    'disposition'      =>
                        array(
                            'default'          => 1,
                            'dub'              => 0,
                            'original'         => 0,
                            'comment'          => 0,
                            'lyrics'           => 0,
                            'karaoke'          => 0,
                            'forced'           => 0,
                            'hearing_impaired' => 0,
                            'visual_impaired'  => 0,
                            'clean_effects'    => 0,
                            'attached_pic'     => 0,
                            'timed_thumbnails' => 0,
                        ),
                    'tags'             =>
                        array(
                            'creation_time' => '2017-01-03T13:51:21.000000Z',
                            'language'      => 'eng',
                            'handler_name'  => 'Stereo',
                        ),
                ),
        ),
    'format'  =>
        array(
            'filename'         => '/Users/jakob/Downloads/Speaker_Preview_HB_v1.mp4',
            'nb_streams'       => 2,
            'nb_programs'      => 0,
            'format_name'      => 'mov,mp4,m4a,3gp,3g2,mj2',
            'format_long_name' => 'QuickTime / MOV',
            'start_time'       => '0.000000',
            'duration'         => '210.582000',
            'size'             => '36340006',
            'bit_rate'         => '1380555',
            'probe_score'      => 100,
            'tags'             =>
                array(
                    'major_brand'       => 'mp42',
                    'minor_version'     => '512',
                    'compatible_brands' => 'isomiso2avc1mp41',
                    'creation_time'     => '2017-01-03T13:51:21.000000Z',
                    'encoder'           => 'HandBrake 1.0.1 2016122900',
                ),
        ),
);

return $meta;
