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
  ],
}
