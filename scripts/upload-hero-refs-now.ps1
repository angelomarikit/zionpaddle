$base = "D:\pickle ball paddle\public\assets\dayo"
$jobs = @(
  @{ file = "$base\03_volt_lime.jpg"; type = "image/jpeg"; url = $env:HF_URL_03 }
  @{ file = "$base\04_cobalt_rush.jpg"; type = "image/jpeg"; url = $env:HF_URL_04 }
  @{ file = "$base\05_lavender_coral.jpg"; type = "image/jpeg"; url = $env:HF_URL_05 }
)
foreach ($j in $jobs) {
  if (-not $j.url) { continue }
  curl.exe -f -X PUT -H "Content-Type: $($j.type)" --data-binary "@$($j.file)" $j.url
}