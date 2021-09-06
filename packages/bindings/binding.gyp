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
      # These coverage options are currently only compatible with non-Windows OSes.
      ['OS!="win"',
        {
          'variables': {
            # Lerna seems to strips environment variables. Workaround: create `packages/bindings/GENERATE_COVERAGE_FILE`
            'generate_coverage': '<!(test -e GENERATE_COVERAGE_FILE && echo "yes" || echo $GENERATE_COVERAGE)',
          },
          
          # Only works with `gcc` (not Windows), for now
          'conditions': [
            ['generate_coverage=="yes"',
              {
                'cflags+': ['--coverage'],
                'cflags_cc+': ['--coverage'],
                'link_settings': {
                    'libraries+': [
                    '-lgcov',
                    # To test if this condition is executing, cause an error by including a missing/non-existant library
                    # '-lmissing',
                  ],
                },
              },
            ]
          ],
        }
      ],

      # Below is an attempt to use the same blanket settings for all platforms. Unfortunately, this does not work.
      # Remove `.disabled` to test with all systems
      ['generate_coverage=="yes.disabled"',
        {
          'cflags+': ['--coverage'],
          'cflags_cc+': ['--coverage'],
          'link_settings': {
            'libraries+': [
              '-lgcov',
              # To test if this condition is executing, cause an error by including a missing/non-existant library
              '-lmissing',
            ],
          },
        },
      ]
    ]
  }],
}
