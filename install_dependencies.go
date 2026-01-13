package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	fmt.Println("Starting dependency installation...")
	fmt.Println("Running 'npm install'...")

	cmd := exec.Command("npm", "install")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		fmt.Printf("Error installing dependencies: %v\n", err)
		pauseAndExit(1)
	}

	fmt.Println("\nDependency installation completed successfully!")
	pauseAndExit(0)
}

func pauseAndExit(code int) {
	fmt.Println("\nPress Enter to exit...")
	fmt.Scanln()
	os.Exit(code)
}
