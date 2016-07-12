{
  'variables': 
  {
    'winplat%': '',
  },
  'targets': [
    {
      'target_name': 'serialport',
      'sources': [
        'src/serialport.cpp',
      ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ],
      'conditions': [
        ['OS=="win"',
          {
            'conditions': [
              ['node_uwp_dll!="true"',
                {
                  'sources': [
                    'src/serialport_win.cpp',
                    'src/win/disphelper.c',
                    'src/win/enumser.cpp',
                  ],
                  'msvs_settings': {
                    'VCCLCompilerTool': {
                      'ExceptionHandling': '2',
                      'DisableSpecificWarnings': [ '4530', '4506' ],
                    },
                  },
                }
              ],
              ['node_uwp_dll=="true"',
                {
                  'defines': [
                    'UWP=1',
                  ],
                  'sources': [
                    'src/serialport_uwp.cpp',
                  ],
                }
              ],
            ],
          },
        ],
        ['OS=="mac"',
          {
            'sources': [
              'src/serialport_unix.cpp',
              'src/serialport_poller.cpp',
            ],
            'xcode_settings': {
              'OTHER_LDFLAGS': [
                '-framework CoreFoundation -framework IOKit'
              ]
            }
          }
        ],
        ['OS!="win"',
          {
            'sources': [
              'src/serialport_unix.cpp',
              'src/serialport_poller.cpp',
            ],
          }
        ],
      ],
    }
  ],
}
