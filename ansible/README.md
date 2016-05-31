# Run puppet on the crosscan staging system and jenkins slaves using Ansible

## Problem

We are using puppet to provision our systems but we currently don't have
a puppet master which makes system changes a bit harder as it has to be.

Until now we used a little shell script which in turn used rsync to synchronize
the files and afterwards executed `puppet apply` via ssh.

The problems with the shell script were:

- no confirmation before execution
- manual changes to only affect the wanted hosts

## Solution

Use Ansible.

Ansible brings some features which solve the above problems very easily by
first prompting for confirmation. So, if one accidentily runs the ansible
command, nothing will happen until you explicitly type 'YES' at the
confirmation prompt.
Another features enables us to apply the changes only to the jenkins slaves,
the staging system or even only to a single jenkins slave in case the changes
should be tested first.

## Usage

Ensure you are located within the `ansible` directory.

Before anything bad happens, you will be prompted to type uppercase `YES` to
confirm you know what you do.

Apply all changes on all hosts:

```
ansible-playbook playbooks/puppet-on-staging.yml
```

Apply all changes only on jenkins slaves:

```
ansible-playbook playbooks/puppet-on-staging.yml -l jenkins-slaves
```

Apply all changes only on the first jenkins slave:

```
ansible-playbook playbooks/puppet-on-staging.yml -l slave01
```

Apply all changes only on staging:

```
ansible-playbook playbooks/puppet-on-staging.yml -l staging
```
