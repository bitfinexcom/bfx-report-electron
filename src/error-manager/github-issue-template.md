${description}

---

| Debug info | |
| :--- | :--- |
| Version | ${version} |
| Commit Hash | ${commitHash} |
| Commit Date | ${commitDate} |
| Electron | ${electronVersion} |
| Chrome | ${chromeVersion} |
| Node.js | ${nodeVersion} |
| V8 | ${v8Version} |
| OS version | ${osVersion} |
| OS release | ${osType} ${osArch} ${osRelease} |
| CPUs | ${cpuModel} x ${cpuCount} |
| RAM | ${totalRamGb}GB (${freeRamGb}GB free) |
| App RAM limit | ${ramLimitMb}Mb (${usedRamMb}MB used) |
| Is BFX API Staging used | ${isBfxApiStagingUsed} |
| Is AppImage used | ${isAppImageUsed} |

<details>

<summary>Main log</summary>

```vim
${mainLog}
```

</details>

<details>

<summary>Worker errors</summary>

```vim
${workerErrors}
```

</details>

<details>

<summary>Worker exceptions</summary>

```vim
${workerExceptions}
```

</details>

---

*The issue was opened from the electron app*
