# Adds our authorized keys to puppet
class annostation_base::authorized_keys() {
  ssh_authorized_key { 'jenkins for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAABAQDDahZiXck7m69DbERkiM/MS1Q49rh/nzgqrFf/7I3hSkb+0ZW7nftvHeUQdzqs16nb1Jo/u4BEEALa21aFPw1pyfzKhWsKTp4nXqZV4qwB6Vheo8uLUucxT/SRr1tgc0KOtPcwPUWZ+Pn1Mc98MVh74ycp66B91HfUJQrXAY1bE9der2I66qBLxsRx1PR2NE2psl2CRED3Y1xoj1LO65eUjrNkA/Nbjrh2LAdiwB4EsKVredwN1G7kX1PEaC1SaLvHEUB59aT4dX3Li9IITCA/26cjt3b34n/0Hl9qD1QJgGqae8h/UGBckrmwSTfbbPPyllgmMSi0EdnQDpTlH14x',
  }
  ssh_authorized_key { 'cho@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAABIwAAAQEApE2N+sZ6vXHqmTyn38lfvyp+AUVIuAvp0ZV7W5hHmuxQo/Pgtm4EMmoMPMg3UCXP2d3m2YpdDh1rR/dwuQ1yhQOs23dz8KZfviCb4Q35PDxaOG49O1Sp5B68C/twUeIF8AbeQSL9xm8/OKjOw2S4G4n9VsZD2g0Na+VgDvRbodPFkquUmKgezpp1unClC2PApklsnzHmyGqeNN8HDDBJ4Hlxblmjz5gVD5BZByGBjiIpc+A4veEO4qpb+1MihLALMzZC+NP5x+rCAY6sW0fo/2bAIZ/q2g70LTneMi3K7pMJG3CMKUcrQ9IqiHREc/eDaQBkwsyPsRAlOFETx9LIJw==',
  }

  ssh_authorized_key { 'jaw@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDItZeKs1FgQV4SvB9t5CTV2VbrS950EQ5uBKXxBj9ul4TOh5lVDjydAyDo2IoU2lYdSCp2beoOqU4O2CwsiwsVGoDxJBo59RPkJw7PgQ1v/KlroOTt1y5TZqw/6Ya6s3h+pAHaSQ0Csb/bbh6xuugWYrypVjy0HN55cDOhwmZA/6vSqBLAeEzySLOJat3rGR4V3eQ5OhOnHCmOBD2Zp894bgxWJMMtRjlpSh2W0mPw12cgnWUTxfcbh6VPEQnVD5i1scN2VPu8KYOwF07VZXQnjgbDtIJZHP+agzmOh1pRt2hMp5fFBITps9vd+pJ6nWIgr9dkWOBZfx9Iytz5zTZRCR52veN+GSdvatllhZOFS9wG1Z2diygrEvUAXWcQE+idaYXLSQJTbbWMRR0Z9Lr3GU1XFG9zJwMBOc433yAAz50wpahBNAtRYG2JlKOzTjPOObakKmpgrsrwKn7Xsj1ymPaRdVPMVx0twzKSo6/+AAzohoLLtyBwjiAYjOSGQ8hM849G3ieV0+BnOy8NlqkKvtrDWJg8rxCx1W+jVC2y81szaQGNb4r44Stio1w40fYWaNa5Qp9lzbf9f0IrV663+MY+/6PntUy3NSXM9nqvpbZSxTslzGVGfWB+WmiGL72ErtTEAzivShN71VGwlwCP5k4n0fel6NfdwKPKxVm5Rw==',
  }

  ssh_authorized_key { 'fls@crosscan.com for root':
    user => 'root',
    type => 'ssh-ed25519',
    key  => 'AAAAC3NzaC1lZDI1NTE5AAAAID+p8NmefEMM0gvfcr36HUKzb/Dh7rx4JvHusSQ7xgVD',
  }

  ssh_authorized_key { 'ses@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAABAQDSdIDiYw7by3tsD46FOS3kEASU5bhoNHpI2GZbXYrQ4FMzAKiw7Kyki6165QfBH2BkD/SyuPLoe8hs4Km5lP0QANr40BxzZtmQVjlR7bT8KAHJM1115o8JsVKa9jNon8ISP9q/Ti3hiEQ4P2ocAnnt6N/6wCwAT0mFOkvFQ7iml+jJmh/DZ8FcHdUwVD/zJ0I8oD0IpTsnsQZck6ZWx3FL1lGFdOnZQ34DsMh3Bt+BnXAbgVRv8uF7AicvQa2I2UczKpLeSWTGyDrOnak71i9OcRLMW+lRi9fuGN8x0s+eaEMk5G+voTMXdKMsJOgwAw6prEhC6D/eBHkbmCPD9csh',
  }

  ssh_authorized_key { 'jad@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAABIwAAAQEAwn7aB8aVAwe51O4m0+RSp/jPf0V/d+Flk+JGSE7LN6RzkDbK1war/BNGFgkc3/VS6HQboehbYfquj3VufJntEWSocBDd8ThFgXAwaWvvGogRHCcoAAH8gQJJY3CzZ74gJu/zZnTPRhJgGhaY05h7lbcqbIRIHZN/dmxLRf2DmR8qg+/h2oT+CWhkK/5BpHRswCBsZIEhIJHtxBmTMxdkluFvS0JOuPfrUcryzT26udYsplWC9NYQmnho4tEBMvaCaqgPIRg4JXQwoFfi8k1r+O7eebOv66uu0kMq8YmpR9qGk2/EnMU8ySJybnEoUFp2PCCk9XYq5NGoxkpYjsbdyQ==',
  }

  ssh_authorized_key { 'chh@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAABAQC9hXRmSLWPkAZLCArJBzQMyIkW3WXLAO+T37QbjqwTwl2j2VV+DyHf8wMFVdOhFeblMFoIPyDK96fq8xS+MlhonTGh5qgEBjCWUSoWutc0JvbzNktOngdFxlNs8FjYnsuPsMbjZRDvM0wBWwsqWzEQ+5fbHcI1r8dNiS1wsVvOSi6wG5Nrf2mO2JWkr+fp+4HcaFMTPqgxqJnOA6lRkQtLmzMdbbC6R4ouNr2PcW9lZjh8CtqwBGkS+nW7IPetavCjg0a3ekczdtAonPEhpmVAjuZHpD/kGsDMDFmVJkEw192kdmgifqKzs1nhyOXefOo36KgD6YkjeealhwV8gUAX',
  }

  ssh_authorized_key { 'cht@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDB7lm1alHdUAz6bq1o1ZQSxPRlni+kXBCRqOAVQDsIh3ehWPngBl+J/7/TrfuEmR0NwUA0nmFatE01QAbDMoBRjApdSUFnlpSnA5nIZuKNrJR0W6C/q+CgDTZZRY+JDH4qqAPWmdkjeL3MgDw2HrjhD1JKnRT67HEZHLHFGil+HBNq79rgZUjtXbQsFawpIFBKJdEydY8tvIXpVcBmaMbSwU8Ry8nPwd6RJiAW6Y2dgWYf7NbJBH25L8znjnB4i6YGxI12MzpVNwJx9f4YE4hLKNwuyMkgLoef+7vcmOua8kVQGQFx2I0wO6st/7dRcuiq8I+ATigkGLDNPG5RyiUykR+UXS0FTjAL6u0fxZcLW205HUOy6n/E2epixu4h4/YxAfkdw4OcU8h6gwj0FLo/4vldoDGlEGkIm4aRZ4Av4LiD+ZvQTyxBgv6QpLVdohemeo7TQmwL2/2353sWA+UNPVqYe2H5IbZAFczi1eRrwZ++iyoEga8QGXVFrRvRGoD1cpj2mTY13z3vd5lTO4B6z6x26spO4mQOohIyRk5ZkHj6phe3TMQU5s2n7zIT81rKFluTNKDZ2V6BO1QqWqpku5kOmwDW9SnaZ5mAlef4Pk8PC/tdpzy8lOi6DwzL83lWmxJTBjuFYBfhdypZPB8JFMr1Xgbv1qhAjSn+7YUGdw==',
  }
  
  ssh_authorized_key { 'fek@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAABIwAAAQEA8KARHlqTD80K4EZj7CRHp2pknzZ2O5BVpyZGiVrqoyrevx2ou50a2igtCQcTK1u/Sc7qak2NvIl0U953HuYIL7hC39Y62IZ2kMa5cjZW1EuG8nO3iLiHDIZTmrQ+TFK8zgiZdv9QKKTwpcAIqj3cWKr+49OfsW/BYYzQuuz2OcbR10jBpULdRAb8Nn7a9wU1mBOV5Lyb4ZmF4W6IQm6NDe1lHhT7C04gM78IPO5pkMqFf7f3xEhipwK7nrqpPwDP8I/ydT/a6VjarZM8q4aCZV2Fp4E/MpY/BKN0lxe7jk7E7x4u6ebV2RO92aPjek3Rw4u7F7hf60xg76Ag54tJew==',
  }

  ssh_authorized_key { 'doe@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAABAQC1TBAVmSRcgfhApwwfD6hwWPNp/Oz7VSnrP4bdV94l46ntJFfep5olHoRWatygH+kGpMEYz+fpNEVaVOtT/RjaRV1AbYsWb9dciB+y4dA0DJCOoMCF6QpASqp8t+bnv0adUKHuI6LocDkC/d4+OxY+TgvsFQO20Mk3HX2SSJaIy31l6U31KqEeH85P9XzcSycquyGjdv5ZDlMVKUj5R9JoB2Zt5I/lRk1KGpGUmGDBk4Cv+egUQIucTR0oDhsioOcooVjE2ovFitTzRS9c2mAL3kda+9BfKUUbn+/7+ZfaCdyBu3u0UUt+G753yvMZEXPejHJxIQWhf8JVmlqoa2Zn',
  }

  ssh_authorized_key { 'ssc@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDCPP86+GyK23jlvqh/Q1guu0lCNIrc0JiCRSjV9Zeo5d2s4U+/Gd+kZtAMXyl0yNYfgzbNBNHDcL2W0a8qUARc9TFjvbr/gxZZtNUTouVEpqLY8tyf6hGo/awAz91XazZQ4/6sBMsSzhgmp5ccc0vqkY+1L93mSLNdqrr4uZGs/NxLWEhsUvEL9acRkKpSqpdfNpS28C9ZzcnEJNOV6eGOb6PFOCrNwUx+GVQbM2T8ln0W81vayviccVDm2OhAuYqa28RNzd/7PirrWav2Ad3OaNrv1daI5mnq9ilfQu8DBY6jeoClrKQq0JSuSv56aG7fJcBrOFvadRMH8v3zmwmvwpr2/nU3oVxiA1xbbDYGEsbTtbbyv0c/0JoSDt3Zc6pScVpoGtNuz1LlzzMMlu/KY/JPKskyHdb4kqelnsHuy3fUlI0rR8hxMJz8nCIaGURqScTL50sLBgrbeM0ngf1/HN2bNr3+hVx9rcsyaj7yJucEOoOtWiCWOegMqXJuIChhyWWEKv6dPN/Hs08MLhi5b807tZE1MeWae34CR7yVop3GYAM3NxDRYTdo+HskWPnw2OpLPddUE4qhp+HfTM8yWxnTM/GfR8CtVlerOG+yqrVhNJzAqgTN1ZPVendEv4AdbHVz8XfyeWvWhGRFDxnivy2Kx7MHF2ct2K3zgDnyqQ==',
  }
}
