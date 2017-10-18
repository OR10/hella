require 'spec_helper_acceptance'

# Here we put the more basic fundamental tests, ultra obvious stuff.
describe "default parameters" do
    it 'should run successfully' do
      pp = "class{'crosscan_base::apt': } class {'apt': } class { 'rabbitmq': }"

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      expect(apply_manifest(pp, :catch_failures => true).exit_code).to be_zero
    end

    describe service('rabbitmq') do
        it { should be_running }
        it { should be_enabled }
    end

    describe port(15672) do
        it { should be_listening.with('tcp') }
    end
end

