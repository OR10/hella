<?php
$meta                 = new AppBundle\Model\Video\MetaData();
$meta->format         = 'avi';
$meta->width          = 1024;
$meta->height         = 620;
$meta->fps            = 22.016999774019961;
$meta->duration       = '29.431803';
$meta->sizeInBytes    = 64;
$meta->numberOfFrames = '648';
$meta->raw            = array(
    'streams' =>
        array(
            0 =>
                array(
                    'index'                => 0,
                    'codec_name'           => 'mpeg4',
                    'codec_long_name'      => 'MPEG-4 part 2',
                    'profile'              => 'Advanced Simple Profile',
                    'codec_type'           => 'video',
                    'codec_time_base'      => '1000/22017',
                    'codec_tag_string'     => 'XVID',
                    'codec_tag'            => '0x44495658',
                    'width'                => 1024,
                    'height'               => 620,
                    'coded_width'          => 1024,
                    'coded_height'         => 620,
                    'has_b_frames'         => 1,
                    'sample_aspect_ratio'  => '1:1',
                    'display_aspect_ratio' => '256:155',
                    'pix_fmt'              => 'yuv420p',
                    'level'                => 5,
                    'chroma_location'      => 'left',
                    'refs'                 => 1,
                    'quarter_sample'       => 'false',
                    'divx_packed'          => 'false',
                    'r_frame_rate'         => '22017/1000',
                    'avg_frame_rate'       => '22017/1000',
                    'time_base'            => '1000/22017',
                    'start_pts'            => 0,
                    'start_time'           => '0.000000',
                    'duration_ts'          => 648,
                    'duration'             => '29.431803',
                    'bit_rate'             => '1915381',
                    'nb_frames'            => '648',
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
            'filename'         => '/Users/jakob/Customers/crosscan/anno-station-videos/100_testvideos_with_calibration/SMPCA5160_SE-OOX687_20140713_144344_rgb_c.avi',
            'nb_streams'       => 1,
            'nb_programs'      => 0,
            'format_name'      => 'avi',
            'format_long_name' => 'AVI (Audio Video Interleaved)',
            'start_time'       => '0.000000',
            'duration'         => '29.431803',
            'size'             => '7059964',
            'bit_rate'         => '1919002',
            'probe_score'      => 100,
        ),
);

return $meta;