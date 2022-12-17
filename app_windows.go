package main

import (
	"golang.org/x/sys/windows"
	"os/exec"
)

func HideExecWindows(c *exec.Cmd) {
	c.SysProcAttr = &windows.SysProcAttr{
		HideWindow: true,
	}
}
