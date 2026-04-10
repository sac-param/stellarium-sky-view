import glob
import os
import sys

vars = Variables()
vars.AddVariables(
    EnumVariable('mode', 'Build mode', 'debug',
        allowed_values=('debug', 'release', 'profile')),
    BoolVariable('es6', 'Create ES6 js module', False),
    BoolVariable('werror', 'Warnings as error', True),
)

VariantDir('build/src', 'src', duplicate=0)
VariantDir('build/ext_src', 'ext_src', duplicate=0)

# Force POSIX platform to get Unix-style flags
env = Environment(variables=vars, PLATFORM='posix')

# Propagate the current environment to subprocesses
env['ENV'] = os.environ.copy()

# Ensure emcc.bat uses the bundled Python
if 'EMSDK_PYTHON' in os.environ:
    env['ENV']['_EM_PY'] = os.environ['EMSDK_PYTHON']

# Common compiler flags (only for compilation)
env.Append(CFLAGS= '-Wall -std=gnu11 -Wno-unknown-pragmas -D_GNU_SOURCE '
                   '-Wno-missing-braces',
           CXXFLAGS='-Wall -std=gnu++11 -Wno-narrowing '
                    '-Wno-unknown-pragmas -Wno-unused-function')

if env['werror']:
    env.Append(CCFLAGS='-Werror')
    env.Append(CCFLAGS='-Wno-unused-but-set-variable')

if env['mode'] == 'debug':
    env.Append(CCFLAGS=['-O0', '-DCOMPILE_TESTS'])
else:
    # For release/profile, use -O3 for compilation
    env.Append(CCFLAGS=['-O3'])

if env['mode'] in ['profile', 'debug']:
    env.Append(CCFLAGS='-g')

if env['mode'] != 'debug':
    env.Append(CCFLAGS='-DNDEBUG')

sources = (glob.glob('src/*.c*') + glob.glob('src/algos/*.c') +
           glob.glob('src/projections/*.c') + glob.glob('src/modules/*.c') +
           glob.glob('src/utils/*.c') + glob.glob('src/private/*.c'))
env.Append(CPPPATH=['src'])

env.Append(CCFLAGS='-include config.h')

sources += glob.glob('ext_src/erfa/*.c')
env.Append(CPPPATH=['ext_src/erfa'])

sources += glob.glob('ext_src/json/*.c')
env.Append(CPPPATH=['ext_src/json'])

env.Append(CPPPATH=['ext_src/uthash'])
env.Append(CPPPATH=['ext_src/stb'])

sources += glob.glob('ext_src/zlib/*.c')
env.Append(CPPPATH=['ext_src/zlib'])
env.Append(CFLAGS=['-DHAVE_UNISTD_H'])

sources += glob.glob('ext_src/inih/*.c')
env.Append(CPPPATH=['ext_src/inih'])

sources += glob.glob('ext_src/nanovg/*.c')
env.Append(CPPPATH=['ext_src/nanovg'])

sources += glob.glob('ext_src/md4c/*.c')
env.Append(CPPPATH=['ext_src/md4c'])
env.Append(CFLAGS=['-DMD4C_USE_UTF8'])

# Add webp
sources += (
    'ext_src/webp/src/dec/alpha_dec.c',
    'ext_src/webp/src/dec/buffer_dec.c',
    'ext_src/webp/src/dec/frame_dec.c',
    'ext_src/webp/src/dec/idec_dec.c',
    'ext_src/webp/src/dec/io_dec.c',
    'ext_src/webp/src/dec/quant_dec.c',
    'ext_src/webp/src/dec/tree_dec.c',
    'ext_src/webp/src/dec/vp8_dec.c',
    'ext_src/webp/src/dec/vp8l_dec.c',
    'ext_src/webp/src/dec/webp_dec.c',
    'ext_src/webp/src/utils/bit_reader_utils.c',
    'ext_src/webp/src/utils/color_cache_utils.c',
    'ext_src/webp/src/utils/filters_utils.c',
    'ext_src/webp/src/utils/huffman_utils.c',
    'ext_src/webp/src/utils/quant_levels_dec_utils.c',
    'ext_src/webp/src/utils/random_utils.c',
    'ext_src/webp/src/utils/rescaler_utils.c',
    'ext_src/webp/src/utils/thread_utils.c',
    'ext_src/webp/src/utils/utils.c',
    'ext_src/webp/src/dsp/cpu.c',
    'ext_src/webp/src/dsp/dec_clip_tables.c')

for fname in ['alpha_processing', 'dec', 'filters', 'lossless', 'rescaler',
        'upsampling', 'yuv']:
    sources += ('ext_src/webp/src/dsp/' + fname + '.c', )

env.Append(CPPPATH=['ext_src/webp'])
env.Append(CPPPATH=['ext_src/webp/src'])

sources = ['build/%s' % x for x in sources]

# Manually set compiler and linker to use emscripten
if not env.GetOption('clean'):
    emsdk_root = os.environ['EMSCRIPTEN']
    env['CC'] = os.path.join(emsdk_root, 'emcc.bat')
    env['CXX'] = os.path.join(emsdk_root, 'em++.bat')
    env['LINK'] = os.path.join(emsdk_root, 'emcc.bat')
    # Override the compile/link command lines to use -o correctly
    env['CCCOM'] = '$CC -c $CFLAGS $CCFLAGS $_CPPDEFFLAGS $_CPPINCFLAGS -o $TARGET $SOURCES'
    env['CXXCOM'] = '$CXX -c $CXXFLAGS $CCFLAGS $_CPPDEFFLAGS $_CPPINCFLAGS -o $TARGET $SOURCES'
    env['LINKCOM'] = '$LINK $LINKFLAGS -o $TARGET $SOURCES $_LIBDIRFLAGS $_LIBFLAGS'

# Clang does not like overrided initializers.
env.Append(CCFLAGS=['-Wno-initializer-overrides'])
env.Append(CCFLAGS=['-Wno-deprecated-non-prototype'])
env.Append(CCFLAGS='-DNO_LIBCURL')

# All the emscripten runtime functions we need – updated for modern Emscripten
# All the emscripten runtime functions we need – only JS‑side runtime methods
extra_exported = [
    'ALLOC_NORMAL',
    'GL',
    'UTF8ToString',
    'addFunction',
    'allocate',
    'ccall',
    'cwrap',
    'getValue',
    'intArrayFromString',
    'lengthBytesUTF8',
    'removeFunction',
    'setValue',
    'stringToUTF8',
    'writeArrayToMemory',
    'writeAsciiToMemory',   # still needed by the engine
]
extra_exported = ','.join("'%s'" % x for x in extra_exported)

# Flags that are only for the linker
link_flags = [
    '-s', 'MODULARIZE=1', '-s', 'EXPORT_NAME=StelWebEngine',
    '-s', 'ALLOW_MEMORY_GROWTH=1',
    '-s', 'ALLOW_TABLE_GROWTH=1',
    '--pre-js', 'src/js/pre.js',
    '--pre-js', 'src/js/obj.js',
    '--pre-js', 'src/js/geojson.js',
    '--pre-js', 'src/js/canvas.js',
    '-s', 'RESERVED_FUNCTION_POINTERS=10',
    '-O3',
    '-s', 'USE_WEBGL2=1',
    '-s', 'NO_EXIT_RUNTIME=1',
    '-s', 'EXPORTED_FUNCTIONS=["_malloc","_free"]',   # wasm functions
    '-s', 'EXPORTED_RUNTIME_METHODS=[%s]' % extra_exported,   # JS runtime methods
    '-s', 'FILESYSTEM=0'
]

if env['mode'] in ['profile', 'debug']:
    link_flags += ['--profiling']

if env['mode'] == 'debug':
    link_flags += ['-s', 'SAFE_HEAP=1', '-s', 'ASSERTIONS=1',
                   '-s', 'WARN_UNALIGNED=1']

if env['es6']:
    link_flags += ['-s', 'EXPORT_ES6=1', '-s', 'USE_ES6_IMPORT_META=0']

env.Append(LINKFLAGS=link_flags)

# Additional flags for both (like -DNO_ARGP, -DGLES2 1) are compile‑time only
env.Append(CCFLAGS=['-DNO_ARGP', '-DGLES2 1'])

# Build the JavaScript/WASM target
prog = env.Program(target='build/stellarium-web-engine.js', source=sources)
env.Depends(prog, glob.glob('src/*.js'))
env.Depends(prog, glob.glob('src/js/*.js'))

# The .wasm is generated as a side effect of building the .js
env.Depends('build/stellarium-web-engine.wasm', prog)

# Do NOT build the native executable
# env.Program(target='build/stellarium-web-engine', source=sources)

# Run asset generation before each compilation
from subprocess import call
call(['python', 'tools/make-assets.py'])