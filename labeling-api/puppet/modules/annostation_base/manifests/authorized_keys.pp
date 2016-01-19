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
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAABIwAAAgEAvz9l2/Heiz+s7N9WR4fYW8pDQkfHMW1A0whot489Yr3nCLd4x2MgY0LF/Re7cuj6Egax1HO5ZEPEh8QvSSc5t9xyTVwkHsEJe/mHtfGyX3WfYgNIkrR25T7Ld4fDKosO9vln13zqHcl0Ubie37obSNFDHQ0QfPhYksG0B2UoRMdMocZ2mUMrT8rRkLWMvB65zjVMcSJBROO1AYh3kz3JsmbtlbDq07v3RUt6bQlQ/cjoaq8gGcuMNmmBCzMuQQytTU20qLKDW08hsckWwGN2qaEQJhvGYOjo8ztlkBzx8lf8GbNKiedXWzhArrDcbIndfYT9DZ/laNoEZbaqwnmc+5hYCCiqu2lQgAH/WcsXaaqIvbieluRmvgxslrOgLARM5zyx4K9hN5Dy/7X6pW/B43cI8JK7rA9ApmOWLU5I9yxozrbHzfkYmx2TVzD/4hV58mOHyvw+mtoyxUcw0XdNZHkuqSsu6Vn1nniJX3WhBhzYtQ6SDzznvBucPlD4JWhUJsUdrKi2br/gcwnSINCCtlHkjhXoNotX2G/KVE0Fb6B2JyiorSJS9jW2Mc68xqNzw8nrbCTLKbMtcpM16QTJpK1AwNjVKCmQ+E0D8NAHEwuIUz/F/hn2iLWznY3KbgwXOjz4bwnPJKxnm0kfA+3ArQ3JWF86umJEaPfbYXAVdZU=',
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

}
