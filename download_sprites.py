def pull_dp_cap_sprites():
    import glob
    import os
    import re

    IMAGE_PATH = '/Users/quanyails/Downloads/Temporary File 3'
    OUT_PATH = '/Users/quanyails/Downloads/sprites/dp'

    format = re.compile('(front|back)(normal|shiny)-(m|f)(.*).(png)')
    for file in glob.glob(IMAGE_PATH + '/*'):
        basename = os.path.basename(file)
        matches = format.match(basename)
        (direction, color, gender, species, extension) = matches.groups()
        dir = '' if direction == 'front' else 'back'
        col = '' if color == 'normal' else 'shiny'
        mon = species + ('' if gender == 'm' else '-f')
        out_directory = dir + '-' + col
        out_basename = mon + '.' + extension
        out_file = '/'.join((OUT_PATH, out_directory, out_basename))
        path = os.path.dirname(out_file)
        if not os.path.exists(path):
            os.makedirs(path)
        os.rename(file, out_file)


def pull_other_cap_sprites():
    import requests
    import os

    BASE_URL = 'https://play.pokemonshowdown.com/sprites'
    OUT_PATH = '/Users/quanyails/Downloads/sprites'

    mons = [
        'syclar',
        'syclant',
        'syclant-f',
        'revenankh',
        'rebble',
        'tactite',
        'stratagem',
        'breezi',
        'fidgit',
        'fidgit-f',
        'privatyke',
        'arghonaut',
        'arghonaut-f',
        'nohface',
        'kitsunoh',
        'kitsunoh-f',
        'monohm',
        'duohm',
        'cyclohm',
        'cyclohm-f',
        'colosshale',
        'colossoil',
        'colossoil-f',
        'protowatt',
        'krilowatt',
        'krilowatt-f',
        'voodoll',
        'voodoom',
        'voodoom-f',
        'scratchet',
        'tomohawk',
        'tomohawk-f',
        'necturna',
        'mollux',
        'cupra',
        'argalis',
        'aurumoth',
        'brattler',
        'malaconda',
        'cawdet',
        'cawmodore',
        'volkritter',
        'volkraken',
        'snugglow',
        'plasmanta',
        'floatoy',
        'caimanoe',
        'naviathan',
        'crucibelle',
        'crucibelle-mega',
        'pluffle',
        'kerfluffle',
        'pajantom',
        'mumbao',
        'jumbao',
    ]

    def download(url):
        relative_path = url.replace(BASE_URL + '/', '')
        out_filename = '/'.join((OUT_PATH, relative_path))

        response = requests.get(url)
        if not response.ok:
            print 'Image does not exist:', url
            return
        image_data = response.content

        dirname = os.path.dirname(out_filename)
        if not os.path.exists(dirname):
            os.makedirs(dirname)

        with open(out_filename, mode='w') as file:
            file.write(image_data)

    for gen in [
        # 'dpp',
        'bw',
        'bwani',
        # 'xy',
        'xyani',
    ]:
        for dir in ['', '-back', '-shiny', 'back-shiny']:
            for mon in mons:
                extension = '.gif' if 'ani' in gen else '.png'
                filename = '/'.join((BASE_URL, gen + dir, mon + extension))
                download(filename)
