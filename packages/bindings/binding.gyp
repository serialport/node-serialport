{
  'targets': [{
    'target_name': 'bindings',
    'sources': [
      'src/serialport.cpp'
    ],
    'include_dirs': [
      '<!(node -e "require(\'nan\')")'
    ],
    'conditions': [
      ['OS=="win"',
        {
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
      ]
    ]
  }],
}
