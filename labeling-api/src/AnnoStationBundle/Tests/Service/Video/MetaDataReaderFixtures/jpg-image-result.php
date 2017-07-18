<?php
$meta                 = new AppBundle\Model\Video\MetaData();
$meta->format         = 'image2';
$meta->width          = 3840;
$meta->height         = 2160;
$meta->fps            = 25.0;
$meta->duration       = '0.040000';
$meta->sizeInBytes    = 64;
$meta->numberOfFrames = 1;
$meta->raw            = array(
    'streams' =>
        array(
            0 =>
                array(
                    'index'                => 0,
                    'codec_name'           => 'mjpeg',
                    'codec_long_name'      => 'Motion JPEG',
                    'codec_type'           => 'video',
                    'codec_time_base'      => '0/1',
                    'codec_tag_string'     => '[0][0][0][0]',
                    'codec_tag'            => '0x0000',
                    'width'                => 3840,
                    'height'               => 2160,
                    'coded_width'          => 3840,
                    'coded_height'         => 2160,
                    'has_b_frames'         => 0,
                    'sample_aspect_ratio'  => '1:1',
                    'display_aspect_ratio' => '16:9',
                    'pix_fmt'              => 'yuvj444p',
                    'level'                => -99,
                    'color_range'          => 'pc',
                    'color_space'          => 'bt470bg',
                    'chroma_location'      => 'center',
                    'refs'                 => 1,
                    'r_frame_rate'         => '25/1',
                    'avg_frame_rate'       => '0/0',
                    'time_base'            => '1/25',
                    'start_pts'            => 0,
                    'start_time'           => '0.000000',
                    'duration_ts'          => 1,
                    'duration'             => '0.040000',
                    'bits_per_raw_sample'  => '8',
                    'disposition'          =>
                        array(
                            'default'          => 0,
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
                ),
        ),
    'format'  =>
        array(
            'filename'         => '/Users/jakob/Desktop/export/export_2017-07-18_07-26-39/HDvsUHD-compressed.jpg',
            'nb_streams'       => 1,
            'nb_programs'      => 0,
            'format_name'      => 'image2',
            'format_long_name' => 'image2 sequence',
            'start_time'       => '0.000000',
            'duration'         => '0.040000',
            'size'             => '1476849',
            'bit_rate'         => '295369800',
            'probe_score'      => 50,
        ),
);

return $meta;
