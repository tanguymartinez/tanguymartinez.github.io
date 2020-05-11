# Iterate while input not valid, then return input
def choose(text, output, options):
    char = None
    while True:
        output(text)
        try:
            char = str(input())
        except KeyboardInterrupt:
            exit()
        except:
            continue
        if char not in options:
            continue
        else:
            break
    return char

# Define concatenated print
def concatenate(text):
    print(text, end='')

# Return a subset of the list (chosen by the user)
def pickFrom(options):
    selected_options = []
    confirm = 'x'
    skip = ''
    to_print = 'Please mark x under desired selected columns then press enter (only press enter otherwise):\n' + ' '.join(options) + '\n'
    for i in range(len(options)):
        print()
        char = choose(to_print, concatenate, [confirm, skip])
        if char == confirm:
            # selected_options.append(options[i]) # <--- to return string list
            selected_options.append(i) # <--- to return indexes list
            to_print += confirm * (len(options[i])) + ' '
        else:
            to_print += '_' * len(options[i]) + ' '
        print()
        print(to_print)
    print()
    return selected_options
