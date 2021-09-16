{
  'targets': [{
    'target_name': 'bindings',
    'sources': [
      'src/serialport.cpp'
    ],
    'include_dirs': [
      '<!(node -e "require(\'nan\')")'
    ],
    'variables': {
      'generate_coverage': '<!(echo $GENERATE_COVERAGE)',
    },
    'conditions': [
      ['OS=="win"',
        {
          'defines': ['CHECK_NODE_MODULE_VERSION'],
          'sources': [
            'src/serialport_win.cpp'
          ],
          'msvs_settings': {
            'VCCLCompilerTool': {
              'ExceptionHandling': '2',
              'DisableSpecificWarnings': [ '4530', '4506' ],
            }
          }
        }
      ],
      ['OS=="mac"',
        {
          'sources': [
            'src/serialport_unix.cpp',
            'src/poller.cpp',
            'src/darwin_list.cpp'
          ],
          'xcode_settings': {
            'MACOSX_DEPLOYMENT_TARGET': '10.9',
            'OTHER_LDFLAGS': [
              '-framework CoreFoundation -framework IOKit'
            ]
          }
        }
      ],
      ['OS=="linux"',
        {
          'sources': [
            'src/serialport_unix.cpp',
            'src/poller.cpp',
            'src/serialport_linux.cpp'
          ]
        }
      ],
      ['OS=="android"',
        {
          'sources': [
            'src/serialport_unix.cpp',
            'src/poller.cpp',
            'src/serialport_linux.cpp'
          ]
        }
      ],
      ['OS!="win"',
        {
          'sources': [
            'src/serialport_unix.cpp',
            'src/poller.cpp'
          ]
        }
      ],

      # Coverage generation options
      # These coverage options are currently only compatible with non-Windows OSes
      ['generate_coverage=="yes"',
        {
          'cflags+': ['--coverage'],
          'link_settings': {'libraries+': ['-lgcov']},
          'xcode_settings': {
            'GCC_GENERATE_TEST_COVERAGE_FILES': ['YES'],
            'GCC_INSTRUMENT_PROGRAM_FLOW_ARCS': ['YES'],
            'OTHER_CFLAGS+': ['-fprofile-arcs -ftest-coverage'],
            'OTHER_LDFLAGS+': [
              '-fprofile-arcs -ftest-coverage',
              # There has to be a better way to do this...
              '-L/usr/local/lib/gcc/9/gcc/x86_64-apple-darwin19/9.4.0',
            ],
          },
        },
      ],
    ],
  }],
}
