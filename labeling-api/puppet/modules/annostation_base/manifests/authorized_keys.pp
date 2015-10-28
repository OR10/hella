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

  ssh_authorized_key { 'fls@crosscan.com for root':
    user => 'root',
    type => 'ssh-rsa',
    key  => 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDItZeKs1FgQV4SvB9t5CTV2VbrS950EQ5uBKXxBj9ul4TOh5lVDjydAyDo2IoU2lYdSCp2beoOqU4O2CwsiwsVGoDxJBo59RPkJw7PgQ1v/KlroOTt1y5TZqw/6Ya6s3h+pAHaSQ0Csb/bbh6xuugWYrypVjy0HN55cDOhwmZA/6vSqBLAeEzySLOJat3rGR4V3eQ5OhOnHCmOBD2Zp894bgxWJMMtRjlpSh2W0mPw12cgnWUTxfcbh6VPEQnVD5i1scN2VPu8KYOwF07VZXQnjgbDtIJZHP+agzmOh1pRt2hMp5fFBITps9vd+pJ6nWIgr9dkWOBZfx9Iytz5zTZRCR52veN+GSdvatllhZOFS9wG1Z2diygrEvUAXWcQE+idaYXLSQJTbbWMRR0Z9Lr3GU1XFG9zJwMBOc433yAAz50wpahBNAtRYG2JlKOzTjPOObakKmpgrsrwKn7Xsj1ymPaRdVPMVx0twzKSo6/+AAzohoLLtyBwjiAYjOSGQ8hM849G3ieV0+BnOy8NlqkKvtrDWJg8rxCx1W+jVC2y81szaQGNb4r44Stio1w40fYWaNa5Qp9lzbf9f0IrV663+MY+/6PntUy3NSXM9nqvpbZSxTslzGVGfWB+WmiGL72ErtTEAzivShN71VGwlwCP5k4n0fel6NfdwKPKxVm5Rw==',
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

}
