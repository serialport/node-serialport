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
              ['winplat!="uwp"',
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
              ['winplat=="uwp"',
                {
                  'sources': [
                    'src/serialport_uwp.cpp',
                  ],
                  'msvs_settings': {
                    'VCLinkerTool': {
                      'IgnoreDefaultLibraryNames' : ['kernel32.lib','advapi32.lib' ],
                    },
                    'VCCLCompilerTool': {
                      'AdditionalUsingDirectories': [ '$(VCInstallDir)vcpackages;$(WindowsSdkDir)UnionMetadata;%(AdditionalUsingDirectories)' ],
                      'CompileAsWinRT': 'true',
                    }
                  },
                  'libraries': [
                    '-lonecore.lib',
                  ],
                  'configurations': {
                    'Release': {
                      'msvs_settings': {
                        'VCCLCompilerTool': {
                          'RuntimeLibrary': '2',
                       }
                      },
                    },
                    'Debug': {
                      'msvs_settings': {
                        'VCCLCompilerTool': {
                          'RuntimeLibrary': '3',
                        }
                      },
                    }
                  }
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
