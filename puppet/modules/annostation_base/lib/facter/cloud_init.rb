Facter.add(:has_cloud_init) do
  setcode do
    if File.directory? '/run/cloud-init/'
      true
    else
      false
    end
  end
end
