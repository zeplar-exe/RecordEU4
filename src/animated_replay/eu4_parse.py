def get_definitions(file):
    lines = []

    if isinstance(file, str):
        lines = file.split("\n", "\r", "\r\n")
    else:
        lines = file.readlines()

    for line in lines:
        if line.isspace():
            continue

        if line.strip().startswith("#"):
            continue

        definition = line.split("=")

        if len(definition) != 2:
            continue

        name = definition[0].strip()
        value = definition[1].strip()

        yield (name, value)