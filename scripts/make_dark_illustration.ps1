Add-Type -AssemblyName System.Drawing

$src = "C:\Users\AKHILESH\.gemini\antigravity-ide\brain\be7ff1ff-5bd1-4b1e-979c-a8f94fbb72bc\media__1785579848131.jpg"
$dest = "c:\Daybook\assets\images\empty_state_illustration_dark.png"

$img = [System.Drawing.Bitmap]::FromFile($src)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose()
$img.Dispose()

$w = $bmp.Width
$h = $bmp.Height

# Face bounding region relative to image size (Left side character face)
$minFaceX = [int]($w * 0.10)
$maxFaceX = [int]($w * 0.26)
$minFaceY = [int]($h * 0.16)
$maxFaceY = [int]($h * 0.35)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        
        $r = $c.R
        $gColor = $c.G
        $b = $c.B

        $isOuterWhite = ($r -ge 225 -and $gColor -ge 225 -and $b -ge 225)
        $isDarkPixel = ($r -le 110 -and $gColor -le 110 -and $b -le 130)
        $isLightCardBg = ($r -ge 200 -and $gColor -ge 220 -and $b -ge 220 -and -not $isOuterWhite)

        $isInFaceArea = ($x -ge $minFaceX -and $x -le $maxFaceX -and $y -ge $minFaceY -and $y -le $maxFaceY)

        if ($isOuterWhite) {
            # Make outer background 100% transparent
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } elseif ($isDarkPixel) {
            if ($isInFaceArea) {
                # Keep face features (eyes, eyebrows, eyelids, smile) natural dark/black!
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 20, 20, 30))
            } else {
                # Convert clipboard text & outlines to crisp bright white for Dark Mode
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
            }
        } elseif ($isLightCardBg) {
            # Convert light grey card fill to soft dark indigo slate fill
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(220, 30, 41, 59))
        }
    }
}

$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "DARK MODE ILLUSTRATION UPDATED WITH NATURAL BLACK EYES AND EYELIDS!"
