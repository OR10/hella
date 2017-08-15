# Repository Splitting Utillity

## Prerequisites

### GNU xargs

The script needs the GNU version of xargs. If you you are using linux you are most likely fine already.

If you are on a macOS System please install findutils via homebrew:

```
brew install findutils
```

To ensure the tool uses the correct xargs executable you need to add the installed package path to your
`PATH` environment variable:

```
PATH="/usr/local/opt/findutils/libexec/gnubin:$PATH"
```

### ripgrep (rg)

The rewriting process utilizes the `ripgrep` (`rg`) utillity.

For macOS it is available within homebrew:

```
brew install rg
```

For linux please consult the package manager of your distribution

### GNU awk

The GNU version of `awk` (`gawk`) is needed for this script to run properly.

Install via homebrew for macOS:

`brew install gawk`

If you are using linux you will need to alias `awk` to `gawk`, as it is not available under this name
in most distributions:

`alias gawk=awk`
