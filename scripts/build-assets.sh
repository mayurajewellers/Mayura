#!/usr/bin/env bash
# ============================================================================
# Mayura Jewellers — asset preparation pipeline
#
# Takes the client's raw photography, renames every file descriptively,
# upscales with Lanczos, art-directs product cut-outs onto a warm ivory
# ground, and writes an optimised, web-ready library into public/images.
#
# Run from the project root:  bash scripts/build-assets.sh
# Requires: ImageMagick 6+
# ============================================================================
set -euo pipefail

SRC="${1:-/mnt/user-data/uploads/MAYURA JEWELLERS/assests}"
OUT="${2:-public/images}"
IVORY="#F7F3EA"

mkdir -p "$OUT"/{editorial,styled,products,brand,gallery}

# --- helpers ---------------------------------------------------------------

# editorial <source> <target> <width> — upscale + gentle sharpen, sRGB, 4:2:0
editorial () {
  convert "$SRC/$1" -colorspace sRGB \
    -filter Lanczos -resize "${3}x>" \
    -unsharp 0x0.75+0.55+0.008 \
    -quality 84 -sampling-factor 4:2:0 -strip -interlace Plane \
    "$OUT/$2"
  echo "  editorial  $2"
}

# cropped <source> <target> <geometry> <width>
cropped () {
  convert "$SRC/$1" -colorspace sRGB -crop "$3" +repage \
    -filter Lanczos -resize "${4}x>" \
    -unsharp 0x0.75+0.55+0.008 \
    -quality 84 -sampling-factor 4:2:0 -strip -interlace Plane \
    "$OUT/$2"
  echo "  cropped    $2"
}

# product <source> <target>
# White-ground cut-outs are levelled so the backdrop is pure white, then
# MULTIPLY-composited onto a warm ivory 4:5 plate. Multiply leaves the ivory
# untouched wherever the source is white, so the jewellery and its soft
# shadow drop onto the brand ground with no visible seam.
product () {
  convert \
    \( -size 1000x1250 xc:"$IVORY" \) \
    \( "$SRC/$1" -colorspace sRGB \
       -level 0%,95%,1.0 \
       -filter Lanczos -resize 820x820 \
       -unsharp 0x0.8+0.6+0.01 \
       -background white -gravity center -extent 1000x1250 \) \
    -compose Multiply -composite \
    -quality 86 -sampling-factor 4:2:0 -strip -interlace Plane \
    "$OUT/products/$2"
  echo "  product    products/$2"
}

echo "▸ Editorial — models, lifestyle & campaign photography"
editorial "traditional-wear.jpeg"            "editorial/heritage-mother-daughter.jpg" 1080
editorial "casual-wear.jpeg"                 "editorial/everyday-sisters.jpg"         1080
editorial "him.jpeg"                         "editorial/men-signet-ring.jpg"          1080
editorial "gemstone-desktop.jpeg"            "editorial/festive-yellow-saree.jpg"     1000
editorial "gujarati-bride.jpeg"              "editorial/bride-gujarati.jpg"           1080
editorial "telugu-bride.jpeg"                "editorial/bride-telugu.jpg"             1080
editorial "up-bride.jpeg"                    "editorial/bride-north-indian.jpg"       1080
editorial "rivaah-pjws.jpeg"                 "editorial/bridal-couple.jpg"            1080
editorial "dailywear-desktop-new-hr.jpeg"    "editorial/heirloom-generations.jpg"     1000
editorial "kundan-stories.jpeg"              "editorial/kundan-bangles.jpg"           1080

echo "▸ Editorial — jewellery still life"
editorial "gifting-wedding.jpeg"             "editorial/trousseau-gold-set.jpg"       1080
editorial "gifting-anniversary.jpeg"         "editorial/layered-haram-trunk.jpg"      1080
editorial "gifting-auspicious.jpeg"          "editorial/ganesha-pendant-red.jpg"      1080
editorial "rivaah-bangles.jpeg"              "editorial/bridal-ruby-haram.jpg"        1080
editorial "rivaah-haram.jpeg"                "editorial/bridal-gold-set-white.jpg"    1080
editorial "rivaah-plain-gold.jpeg"           "editorial/bridal-antique-haram.jpg"     1080
editorial "rivaah-diamond-jewellery.jpeg"    "editorial/bridal-polki-necklace.jpg"    1080
editorial "rivaah-glass-kundan.jpeg"         "editorial/bridal-emerald-necklace.jpg"  1080
editorial "all-jew-25k-50k-hr.jpeg"          "editorial/ring-floral-filigree.jpg"     1080
editorial "earrings-25k-50k-hr.jpeg"         "editorial/studs-gold-rosette.jpg"       1080
editorial "gold-below-25k-hr.jpeg"           "editorial/toe-rings-gold.jpg"           1080
editorial "dailywear-1l-above.jpeg"          "editorial/bangle-diamond-blush.jpg"     1080
editorial "charms_d.jpeg"                    "editorial/charms-evil-eye.jpg"          900
editorial "earcuffs_d.jpeg"                  "editorial/ear-cuffs-pastel.jpg"         900
editorial "sub10k_d.jpeg"                    "editorial/rings-gemstone-pastel.jpg"    900

echo "▸ Styled — silk-ground portrait still life"
editorial "bracelets-3-4-26.jpeg"            "styled/bracelet-gold-teal.jpg"          1100
editorial "chains-3-4-26.jpeg"               "styled/chain-gold-teal.jpg"             1100
editorial "earrings-3-4-26.jpeg"             "styled/earrings-jhumka-teal.jpg"        1100
editorial "mangalsutra-3-4-26.jpeg"          "styled/mangalsutra-gold-teal.jpg"       1100
editorial "pendants-3-4-26.jpeg"             "styled/pendant-diamond-teal.jpg"        1100

echo "▸ Cropped — campaign text and third-party marks removed"
# Bottom 20% of these two carried campaign lock-ups; cropped away entirely.
cropped "0bb81920-a819-4b70-9f51-d40d1d3d9078.undefined" \
        "editorial/macro-pendant-water.jpg"    "424x400+0+0"   1000
cropped "9f32f365-c2dd-46da-9196-31713c8de518.undefined" \
        "editorial/macro-rosegold-sage.jpg"    "424x392+0+0"   1000
# Right-hand portrait only — the left third held a third-party campaign lock-up.
cropped "Mobile_680x700.jpeg" \
        "editorial/portrait-diamond-noir.jpg"  "370x700+310+0" 900
# Long haram on velvet; cropped below the retail price tags.
cropped "WhatsApp Image 2026-07-22 at 5.42.04 PM (1).jpeg" \
        "editorial/gold-haram-velvet.jpg"      "851x900+0+380" 1000

echo "▸ Products — cut-outs art-directed onto the ivory ground"
product "JE13440-1RS300_11_listfront.jpeg" "earrings-rose-gold-threader.jpg"
product "JE13846-8YS300_11_listfront.jpeg" "earrings-gold-filigree-hoop.jpg"
product "JE14112-8YS300_11_listfront.jpeg" "earrings-gold-diamond-hoop.jpg"
product "JP07530-1YS300_11_listfront.jpeg" "pendant-diamond-leaf.jpg"
product "JP07532-1YS300_11_listfront.jpeg" "pendant-diamond-heart.jpg"
product "JR00864-YGS300_11_listfront.jpeg" "ring-gents-diamond-bar.jpg"
product "JR05074-WGS300_11_listfront.jpeg" "ring-white-gold-halo.jpg"
product "JR07671-YGS300_11_listfront.jpeg" "ring-gents-square-diamond.jpg"
product "JR09437-YGS300_11_listfront.jpeg" "ring-gents-three-stone.jpg"
product "JR11553-8YS300_11_listfront.jpeg" "ring-enamel-scarlet-diamond.jpg"
product "JR11634-1YS300_11_listfront.jpeg" "ring-diamond-vine-band.jpg"
product "JR12047-1YS300_11_listfront.jpeg" "ring-beaded-cluster-solitaire.jpg"
product "JR12176-8YS300_11_listfront.jpeg" "ring-diamond-ribbon.jpg"
product "SR02761-YGP900_11_listfront.jpeg" "ring-split-shank-halo.jpg"
product "UR01011-YG0000_11_listfront.jpeg" "ring-classic-gold-band.jpg"

echo "▸ Brand marks"
if [ -f "$SRC/../__logo.png" ]; then :; fi

echo
echo "Done. Library written to $OUT"
find "$OUT" -type f | wc -l | xargs echo "Total files:"
du -sh "$OUT" | cut -f1 | xargs echo "Total size:"
