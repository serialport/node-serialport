{
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
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
      ]
    }
  ],
}
