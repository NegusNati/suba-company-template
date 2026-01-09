#!/usr/bin/env bash
echo "---- diag start ----"
echo "whoami: $(whoami)"
echo "pwd: $(pwd)"
echo "uname -a: $(uname -a)"
echo "shell: $SHELL"
echo "PATH: $PATH"
echo
echo "ls -l /usr/bin/docker || true"
ls -l /usr/bin/docker || true
echo
echo "file /usr/bin/docker || true"
file /usr/bin/docker || true
echo
echo "ldd /usr/bin/docker 2>/dev/null || echo 'ldd failed or not available'"
ldd /usr/bin/docker 2>/dev/null || true
echo
echo "attempt to run /usr/bin/docker --version (no compose):"
/usr/bin/docker --version 2>&1 || echo "exec failed with exit $?"
echo "---- diag end ----"
