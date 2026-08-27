# Riduce una regione di una foto a una griglia di pixel e ne stampa i colori.
# Serve a ricavare la palette e la disposizione reali invece di indovinarle.
#
#   .\campiona.ps1 -Foto "foto.jpeg" -X 55 -Y 320 -L 220 -A 240 -Celle 16
param(
  [Parameter(Mandatory=$true)][string]$Foto,
  [Parameter(Mandatory=$true)][int]$X,
  [Parameter(Mandatory=$true)][int]$Y,
  [Parameter(Mandatory=$true)][int]$L,
  [Parameter(Mandatory=$true)][int]$A,
  [int]$Celle = 16,
  [string]$Png = ""
)
Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile((Resolve-Path $Foto).Path)
$taglio = New-Object System.Drawing.Bitmap $L, $A
$g = [System.Drawing.Graphics]::FromImage($taglio)
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0,0,$L,$A),
                   (New-Object System.Drawing.Rectangle $X,$Y,$L,$A),
                   [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose(); $src.Dispose()

$righe = [int][Math]::Round($A * $Celle / $L)
$mappa = New-Object 'System.Object[]' $righe

for ($py = 0; $py -lt $righe; $py++) {
  $linea = @()
  for ($px = 0; $px -lt $Celle; $px++) {
    $x0 = [int]($px * $L / $Celle);  $x1 = [int](($px + 1) * $L / $Celle)
    $y0 = [int]($py * $A / $righe);  $y1 = [int](($py + 1) * $A / $righe)
    $r=0;$gg=0;$b=0;$n=0
    for ($yy = $y0; $yy -lt $y1; $yy++) { for ($xx = $x0; $xx -lt $x1; $xx++) {
      $c = $taglio.GetPixel($xx, $yy); $r+=$c.R; $gg+=$c.G; $b+=$c.B; $n++ } }
    $linea += ('{0:x2}{1:x2}{2:x2}' -f [int]($r/$n), [int]($gg/$n), [int]($b/$n))
  }
  $mappa[$py] = $linea
  "{0,2}  {1}" -f $py, ($linea -join ' ')
}

if ($Png) {
  $zoom = 18
  $b2 = New-Object System.Drawing.Bitmap ($Celle*$zoom), ($righe*$zoom)
  $g2 = [System.Drawing.Graphics]::FromImage($b2)
  for ($py = 0; $py -lt $righe; $py++) { for ($px = 0; $px -lt $Celle; $px++) {
    $h = $mappa[$py][$px]
    $col = [System.Drawing.Color]::FromArgb(255,
      [Convert]::ToInt32($h.Substring(0,2),16),
      [Convert]::ToInt32($h.Substring(2,2),16),
      [Convert]::ToInt32($h.Substring(4,2),16))
    $g2.FillRectangle((New-Object System.Drawing.SolidBrush $col), $px*$zoom, $py*$zoom, $zoom, $zoom)
  } }
  $g2.Dispose()
  if (-not [System.IO.Path]::IsPathRooted($Png)) { $Png = Join-Path (Get-Location).Path $Png }
  $b2.Save($Png, [System.Drawing.Imaging.ImageFormat]::Png); $b2.Dispose()
  "-> $Png"
}
$taglio.Dispose()
