$out = "D:\pickle ball paddle\public\media\dayo"
New-Item -ItemType Directory -Force -Path $out | Out-Null
$pairs = @(
  @{ name = "hero-graphite-volt.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105915_0b7739b5-ff71-44fa-ad99-49f6b7589c6c.mp4" },
  @{ name = "colorway-showcase.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105914_05c4e829-f41c-45bb-81bf-65316dd96d64.mp4" },
  @{ name = "product-graphite-volt.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105915_d978ecf6-1006-4a62-9a81-a881cba9e985.mp4" },
  @{ name = "product-signal-orange.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105913_ff5f24af-7430-4d3c-9796-381363bd67c3.mp4" },
  @{ name = "product-volt-lime.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105913_514150b2-ec48-4fea-b36a-cb611aca6acd.mp4" },
  @{ name = "product-cobalt-rush.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105914_a3ebccdf-4544-425b-9348-d082399b6870.mp4" },
  @{ name = "product-lavender-coral.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105914_35fe9429-f5cd-4711-bb03-dd1a28d1cc94.mp4" },
  @{ name = "macro-graphite-volt.mp4"; url = "https://d8j0ntlcm91z4.cloudfront.net/user_3J0ZGGJ2gfOOGOSfIVXTotlcEpl/hf_20261120_105915_38919689-3219-4d70-b929-7b7f07f74c07.mp4" }
)
foreach ($p in $pairs) {
  $dest = Join-Path $out $p.name
  curl.exe -fsSL -o $dest $p.url
  Write-Output "saved $dest ($((Get-Item $dest).Length) bytes)"
}