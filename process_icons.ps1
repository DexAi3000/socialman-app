Add-Type -AssemblyName System.Drawing

$publicDir = "C:\Users\PCMOD\.gemini\antigravity\scratch\social-man\public"

# 1. Instagram: remove checkerboard and export transparent PNG
$igPath = Join-Path $publicDir "instagram-icon.jpg"
$ig = [System.Drawing.Bitmap]::FromFile($igPath)
Write-Host "Instagram size: $($ig.Width)x$($ig.Height)"

$outIg = New-Object System.Drawing.Bitmap($ig.Width, $ig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# The Instagram logo is centered. The checkerboard background has neutral gray/white squares (R, G, B are very close or identical, and R > 180, G > 180, B > 180 or gray).
# While the Instagram icon has vibrant colors: red/pink (R high, G low, B medium/high) or orange/yellow (R high, G high, B low).
# Let's inspect each pixel:
for ($y = 0; $y -lt $ig.Height; $y++) {
    for ($x = 0; $x -lt $ig.Width; $x++) {
        $c = $ig.GetPixel($x, $y)
        # Check if pixel is gray/white checkerboard:
        # Gray square is usually around rgb(204,204,204) and white is rgb(255,255,255)
        # In both, abs(R - G) < 15 and abs(G - B) < 15 and abs(R - B) < 15, and R > 150
        $diffRG = [Math]::Abs($c.R - $c.G)
        $diffGB = [Math]::Abs($c.G - $c.B)
        $diffRB = [Math]::Abs($c.R - $c.B)
        
        # If it's near the edges (outside the logo) and is grayscale
        $distFromCenter = [Math]::Sqrt([Math]::Pow($x - $ig.Width/2, 2) + [Math]::Pow($y - $ig.Height/2, 2))
        $maxCenter = $ig.Width * 0.38
        
        if ($distFromCenter -gt $maxCenter -and $diffRG -lt 20 -and $diffGB -lt 20 -and $diffRB -lt 20 -and $c.R -gt 140) {
            # Transparent
            $outIg.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $outIg.SetPixel($x, $y, $c)
        }
    }
}
$ig.Dispose()
$outIgPath = Join-Path $publicDir "instagram-clean.png"
$outIg.Save($outIgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outIg.Dispose()
Write-Host "Saved clean Instagram to $outIgPath"

# 2. WhatsApp: check and make transparent PNG if background is white
$waPath = Join-Path $publicDir "whatsapp-icon.jpg"
$wa = [System.Drawing.Bitmap]::FromFile($waPath)
Write-Host "WhatsApp size: $($wa.Width)x$($wa.Height)"

$outWa = New-Object System.Drawing.Bitmap($wa.Width, $wa.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $wa.Height; $y++) {
    for ($x = 0; $x -lt $wa.Width; $x++) {
        $c = $wa.GetPixel($x, $y)
        $distFromCenter = [Math]::Sqrt([Math]::Pow($x - $wa.Width/2, 2) + [Math]::Pow($y - $wa.Height/2, 2))
        # WhatsApp logo is a circle with radius approx 46% of width
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245 -and $distFromCenter -gt ($wa.Width * 0.44)) {
            $outWa.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $outWa.SetPixel($x, $y, $c)
        }
    }
}
$wa.Dispose()
$outWaPath = Join-Path $publicDir "whatsapp-clean.png"
$outWa.Save($outWaPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outWa.Dispose()
Write-Host "Saved clean WhatsApp to $outWaPath"

# 3. Telegram: check and make transparent PNG if background is white
$tgPath = Join-Path $publicDir "telegram-icon.jpg"
$tg = [System.Drawing.Bitmap]::FromFile($tgPath)
Write-Host "Telegram size: $($tg.Width)x$($tg.Height)"

$outTg = New-Object System.Drawing.Bitmap($tg.Width, $tg.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $tg.Height; $y++) {
    for ($x = 0; $x -lt $tg.Width; $x++) {
        $c = $tg.GetPixel($x, $y)
        $distFromCenter = [Math]::Sqrt([Math]::Pow($x - $tg.Width/2, 2) + [Math]::Pow($y - $tg.Height/2, 2))
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245 -and $distFromCenter -gt ($tg.Width * 0.45)) {
            $outTg.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $outTg.SetPixel($x, $y, $c)
        }
    }
}
$tg.Dispose()
$outTgPath = Join-Path $publicDir "telegram-clean.png"
$outTg.Save($outTgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outTg.Dispose()
Write-Host "Saved clean Telegram to $outTgPath"
