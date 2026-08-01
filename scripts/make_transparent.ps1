Add-Type -AssemblyName System.Drawing

$src = "C:\Users\AKHILESH\.gemini\antigravity-ide\brain\be7ff1ff-5bd1-4b1e-979c-a8f94fbb72bc\media__1785579848131.jpg"
$dest = "c:\Daybook\assets\images\empty_state_illustration.png"

$img = [System.Drawing.Bitmap]::FromFile($src)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose()
$img.Dispose()

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Check white background pixels (R >= 230, G >= 230, B >= 230)
        if ($c.R -ge 230 -and $c.G -ge 230 -and $c.B -ge 230) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}

$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "TRANSPARENT PNG CONVERTED SUCCESSFULLY!"
