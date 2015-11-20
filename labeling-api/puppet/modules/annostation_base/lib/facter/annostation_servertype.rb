Facter.add(:annostation_servertype) do
  setcode do
    hostname = Facter::Util::Resolution.exec('hostname -f').split("\n").first

    if hostname =~ /.*\-ci\-slave\-/ then
      'jenkins-slave'
    else
      hostname.gsub(/^([a-zA-Z]+)(?:\-?\d+)?\..*$/, '\1')
    end
  end
end
