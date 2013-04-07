{
  'targets': [
    {
      'target_name': 'serialport',
      'sources': [
        'src/serialport.cpp',
        'src/serialport_unix.cpp',
      ],
      'conditions': [
        ['OS=="win"',
          {
            'sources': [
              "src/serialport_win.cpp",
              'src/win/disphelper.c',
              'src/win/enumser.cpp',
            ],
          }
        ],
        ['OS!="win"',
          {
            'sources': [
              'src/serialport_unix.cpp',
            ],
          }
        ],
      ],
    },
  ],
}
