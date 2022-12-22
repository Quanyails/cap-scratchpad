import os
from pathlib import Path

import click
from PIL import Image, ImageColor

HEIGHT = 512
WIDTH = 512


def validate_color(ctx: click.Context, param: click.Parameter, value: str):
    try:
        ImageColor.getrgb(value)
    except ValueError as e:
        raise click.BadParameter(f"{value} is not a valid color")


@click.group()
def cli():
    pass


@click.command()
@click.option("--background_color",
              callback=validate_color,
              default="#FFFFFF",
              )
@click.option("--height", default=HEIGHT, type=click.INT)
@click.option("-i", "--in", "in_pathname",
              required=True,
              type=click.Path(
                  exists=True,
                  file_okay=False,
              ))
@click.option("-o", "--out", "out_pathname",
              required=True,
              type=click.Path(
                  file_okay=False,
                  writable=True,
              ))
@click.option("--width",
              default=WIDTH,
              type=click.INT,
              )
def batch(
        background_color: ImageColor,
        height: int,
        in_pathname: str,
        out_pathname: str,
        width: int,
):
    in_path = Path(in_pathname)
    out_path = Path(out_pathname)

    if in_path.resolve() == out_path.resolve():
        raise click.BadParameter("Input path must be different from output path")

    out_path.mkdir(exist_ok=True)

    for in_file in in_path.iterdir():
        if in_file.is_file():
            try:
                with Image.open(in_file) as image:
                    print(f"Processing {in_file}")
                    processed = image.rotate(90)
                    # processed.show()
                    # TODO: implement
                    out_pathname = out_path / in_file.name
                    processed.save(out_pathname)
            except IOError:
                print(f"Skipping {in_file} because it is not a valid image")
        else:
            print(f"Skipping {in_file} because it is not a file")

    os.startfile(out_path)


if __name__ == "__main__":
    cli.add_command(batch)
    cli()
