import { Body, Controller, Post, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { CourseService } from './course.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }
  @Post()
  createCourse(@Body() body: any) {
    return this.courseService.createCourse(body.userId, body.title);
  }

  @Post('upload-thumbnail/:id')
  @UseInterceptors(
    FileInterceptor('file', {

      // STORAGE
      storage: diskStorage({

        destination: './uploads',

        filename: (
          req,
          file,
          cb,
        ) => {

          const uniqueName =
            Date.now() +
            '-' +
            file.originalname;

          cb(null, uniqueName);
        },
      }),

      // FILE TYPE VALIDATION
      fileFilter: (
        req,
        file,
        cb,
      ) => {

        if (
          !file.mimetype.startsWith(
            'image/',
          )
        ) {

          return cb(
            new Error(
              'Only image files allowed',
            ),
            false,
          );
        }

        cb(null, true);
      },

      // FILE SIZE LIMIT
      limits: {
        fileSize:
          1024 * 1024 * 2,
      },
    }),
  )

  async uploadThumbnail(
  @Param('id') id: string,
  @UploadedFile() file: any,
) {

  return this.courseService
    .saveThumbnail(
      Number(id),
      file.filename,
    );
  }
}
